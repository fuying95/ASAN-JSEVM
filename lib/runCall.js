const Buffer = require('safe-buffer').Buffer
const async = require('async')
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const exceptions = require('./exceptions.js')
const HackerContractCall=require('./hackerContractcall.js')

const ERROR = exceptions.ERROR

/**
 * runs a CALL operation
 * @method runCall
 * @param opts
 * @param opts.block {Block}
 * @param opts.caller {Buffer}
 * @param opts.code {Buffer} this is for CALLCODE where the code to load is different than the code from the to account.
 * @param opts.data {Buffer}
 * @param opts.gasLimit {Buffer | BN.js }
 * @param opts.gasPrice {Buffer}
 * @param opts.origin {Buffer} []
 * @param opts.to {Buffer}
 * @param opts.value {Buffer}
 * @param {Function} cb the callback
 */
module.exports = function (opts, cb) {
  var self = this
  var stateManager = self.stateManager

  var vmResults = {}
  var toAccount
  var toAddress = opts.to
  var createdAddress
  var txValue = opts.value || Buffer.from([0])
  var caller = opts.caller
  var account = stateManager.cache.get(caller)
  var block = opts.block
  var code = opts.code
  var txData = opts.data
  var gasLimit = opts.gasLimit || new BN(0xffffff)
  gasLimit = new BN(opts.gasLimit) // make sure is a BN
  var gasPrice = opts.gasPrice
  var gasUsed = new BN(0)
  var origin = opts.origin
  var isCompiled = opts.compiled
  var depth = opts.depth
  // opts.suicides is kept for backward compatiblity with pre-EIP6 syntax
  var selfdestruct = opts.selfdestruct || opts.suicides
  var delegatecall = opts.delegatecall || false
  var isStatic = opts.static || false
  var hackercontractcall= new HackerContractCall()

  txValue = new BN(txValue)

  stateManager.checkpoint()

  // run and parse
  async.series([
    subTxValue,
    loadToAccount,
    addTxValue,
    loadCode,
    initHackerContractcall,
    runCode,
    closeHackerContractcall,
    saveCode
  ], parseCallResult)

  function loadToAccount (done) {
    // get receiver's account
    // toAccount = stateManager.cache.get(toAddress)
    if (!toAddress) {
      // generate a new contract if no `to`
      code = txData
      txData = undefined
      var newNonce = new BN(account.nonce).subn(1)
      createdAddress = toAddress = ethUtil.generateAddress(caller, newNonce.toArray())
      stateManager.clearContractStorage(createdAddress, function (err) {
        if (err) {
          done(err)
        }

        async.series([
          newContractEvent,
          getAccount
        ], done)

        function newContractEvent (callback) {
          self.emit('newContract', {
            address: createdAddress,
            code: code
          }, callback)
        }

        function getAccount (callback) {
          stateManager.getAccount(createdAddress, function (err, account) {
            toAccount = account
            const NONCE_OFFSET = 1
            toAccount.nonce = new BN(toAccount.nonce).addn(NONCE_OFFSET).toArrayLike(Buffer)
            callback(err)
          })
        }
      })
    } else {
      // else load the `to` account
      toAccount = stateManager.cache.get(toAddress)
      done()
    }
  }

  function subTxValue (cb) {
    if (delegatecall) {
      cb()
      return
    }
    var newBalance = new BN(account.balance).sub(txValue)
    account.balance = newBalance
    stateManager.putAccountBalance(ethUtil.toBuffer(caller), newBalance, cb)
  }

  function addTxValue (cb) {
    if (delegatecall) {
      cb()
      return
    }
    // add the amount sent to the `to` account
    var newBalance = new BN(toAccount.balance).add(txValue)
    toAccount.balance = newBalance
    // putAccount as the nonce may have changed for contract creation
    stateManager.putAccount(ethUtil.toBuffer(toAddress), toAccount, cb)
  }

  function loadCode (cb) {
    // loads the contract's code if the account is a contract
    if (code || !(toAccount.isContract() || self._precompiled[toAddress.toString('hex')])) {
      cb()
      return
    }

    if (self._precompiled[toAddress.toString('hex')]) {
      isCompiled = true
      code = self._precompiled[toAddress.toString('hex')]
      cb()
      return
    }

    stateManager.getContractCode(toAddress, function (err, c, comp) {
      if (err) return cb(err)
      isCompiled = comp
      code = c
      cb()
    })
  }

  function initHackerContractcall () {
    var hackerrunCodeOpts = {
      code: code,
      data: txData,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      address: toAddress,
      origin: origin,
      caller: caller,
      value: txValue.toArrayLike(Buffer),
      block: block,
      depth: depth,
      selfdestruct: selfdestruct,
      populateCache: false,
      static: isStatic
    }
    if(caller!=null){

      hackercontractcall.initHacker(stateManager,hackerrunCodeOpts)
      var hacker_call_stack=hackercontractcall.get_hacker_call_stack()
      if( hacker_call_stack == null){
        console.log("call stack is nil")
        return
      }

      call = hacker_call_stack[hacker_call_stack.length-1]

      if(call == null) {
        console.log("call is nil")
        return
      }
      console.log("get init call")
      nextCall = call.OnCall(caller, toAddress, gasPrice, txData)
      // nextCall.snapshotId = snapshot ???
      if(nextCall== null) {
        console.log("nextcall is nil")
        return
      }
      hacker_call_stack.push(nextCall)
      console.log("\npush call@%p into stack",nextCall)
    }

  }

  function runCode (cb) {
    if (!code) {
      vmResults.exception = 1
      stateManager.commit(cb)
      return
    }

    var runCodeOpts = {
      code: code,
      data: txData,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      address: toAddress,
      origin: origin,
      caller: caller,
      value: txValue.toArrayLike(Buffer),
      block: block,
      depth: depth,
      selfdestruct: selfdestruct,
      populateCache: false,
      static: isStatic
    }

    // run Code through vm
    var codeRunner = isCompiled ? self.runJIT : self.runCode
    codeRunner.call(self, runCodeOpts, parseRunResult)

    function parseRunResult (err, results) {
      toAccount = self.stateManager.cache.get(toAddress)
      vmResults = results

      if (createdAddress) {
        // fee for size of the return value
        var totalGas = results.gasUsed
        if (!results.runState.vmError) {
          var returnFee = new BN(results.return.length * self._common.param('gasPrices', 'createData'))

          totalGas = totalGas.add(returnFee)
        }
        // if not enough gas
        if (totalGas.lte(gasLimit) && (self.allowUnlimitedContractSize || results.return.length <= 24576)) {
          results.gasUsed = totalGas
        } else {
          results.return = Buffer.alloc(0)
          // since Homestead
          results.exception = 0
          err = results.exceptionError = ERROR.OUT_OF_GAS
          results.gasUsed = gasLimit
        }
      }

      gasUsed = results.gasUsed
      if (err) {
        results.logs = []
        stateManager.revert(function (revertErr) {
          if (revertErr || !isCompiled) cb(revertErr)
          else {
            // Empty precompiled contracts need to be deleted even in case of OOG
            // because the bug in both Geth and Parity led to deleting RIPEMD precompiled in this case
            // see https://github.com/ethereum/go-ethereum/pull/3341/files#diff-2433aa143ee4772026454b8abd76b9dd
            // We mark the account as touched here, so that is can be removed among other touched empty accounts (after tx finalization)
            if (err === ERROR.OUT_OF_GAS || err.error === ERROR.OUT_OF_GAS) {
              stateManager.getAccount(toAddress, (getErr, acc) => {
                if (getErr) cb(getErr)
                else stateManager.putAccount(toAddress, acc, cb)
              })
            } else {
              cb()
            }
          }
        })
      } else {
        stateManager.commit(cb)
      }
    }
  }

  function closeHackerContractcall () {
    if (caller != null) {
      console.log("\nclose call...")
      if (hacker_call_stack != null) {
        call = hacker_call_stack.pop()
        call.nextRevisionId = nextRevisionId

      }

    }
    if (caller == null) {
      {
        console.log("call is nil")
        return
      }
      call.OnCloseCall(contract.Gas)

      if (hacker_call_stack.len() == 1) {
        hacker_close()
      }

    }
  }

  function saveCode (cb) {
    // store code for a new contract
    if (createdAddress && !vmResults.runState.vmError && vmResults.return && vmResults.return.toString() !== '') {
      stateManager.putContractCode(createdAddress, vmResults.return, cb)
    } else {
      cb()
    }
  }

  function parseCallResult (err) {
    if (err) return cb(err)
    var results = {
      gasUsed: gasUsed,
      createdAddress: createdAddress,
      vm: vmResults
    }

    cb(null, results)
  }
}
