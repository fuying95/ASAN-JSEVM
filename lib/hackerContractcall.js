const Buffer = require('safe-buffer').Buffer
const oracle = require('./hackerOracle')
const HackerUtils = require('./hackerUtils.js')
const HackerState = require('./hackerState')

/**
 *
 *
 * */

module.exports = HackerContractCall
var hacker_env
var hacker_call_stack
var hacker_call_hashs
var hackerState = new HackerState()
var hacker_calls

function HackerContractCall (operation, caller, callee,
                             value, gas, input, stateManager) {
  this.isInitCall = false
  this.caller = caller
  this.callee = callee
  this.value = value
  this.gas = gas
  this.finalgas = 0
  this.input = input
  this.nextcalls = [] // type:HackerContractCall
  this.OperationStack = [operation]
  // HackerState用statemanager替代了
  this.StateStack = []
  this.stateManager = stateManager
  this.throwException = false
  this.gasException = false
  this.errOutGas = false
  this.errOutBalance = false
  this.snapshotId = 0
  this.nextRevisionId = 0
}

HackerContractCall.prototype.initHacker = function (stateManager, hackerrunCodeOpts) {
  if (hacker_env == null || hacker_call_stack == null) {
    hacker_env = stateManager
    hacker_call_stack = []
    hacker_call_hashs = []
    hacker_calls = [] // type:HackerContractCall
    var initCall = new HackerContractCall('STARTRECORD', hackerrunCodeOpts.caller, hackerrunCodeOpts.callee, hackerrunCodeOpts.value, hackerrunCodeOpts.gasLimit, hackerrunCodeOpts.input, stateManager)
    initCall.isInitCall = true
    // var test=initCall.stateManager
    initCall.StateStack.push(hackerState.newHackerState(initCall.stateManager.cache.get(initCall.caller), initCall.stateManager.cache.get(initCall.callee)))
    hacker_call_stack.push(initCall)
  }
}

HackerContractCall.prototype.get_hacker_call_stack = function () {
  return hacker_call_stack
}

HackerContractCall.prototype.OnCloseCall = function (finalgas) {
  this.finalgas = finalgas // gas used
  this.OperationStack.push('RETURN')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
  // console.log('\ncall@ Closed')
  // fmt.Printf("\ncall@%pClosed",call)
}

HackerContractCall.prototype.OnCall = function (caller, toAddress, gasLimit, input, txValue, stateManager) {
  this.OperationStack.push('CALL')
  this.stateManager = stateManager
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
  // var nextcall = new HackerContractCall('CALL', caller, toAddress, txValue, gasPrice, txData, stateManager)
  // this.StateStack.push(newHackerState(_caller.Address(), _callee))
  var nextcall = new HackerContractCall('CALL', caller, toAddress, txValue, gasLimit, input, stateManager)
  this.nextcalls.push(nextcall)

  // hacker_call_hashs= append(hacker_call_hashs,hash)
  var hackerutils = new HackerUtils()

  hacker_call_hashs.push(hackerutils.Hash(nextcall))
  hacker_calls.push(nextcall)
  return nextcall
}

HackerContractCall.prototype.OnDelegateCall = function (caller, toAddress, gasLimit, input, stateManager) {
  this.OperationStack.push('DELEGATECALL')
// <<<<<<< HEAD
  this.StateStack.push(hackerState.newHackerState(stateManager.cache.get(caller), stateManager.cache.get(toAddress)))
  // var nextcall = new HackerContractCall('DELEGATECALL', caller, toAddress, 0, gasPrice, txData, stateManager)
// =======
//   this.StateStack.push(stateManager)
  var nextcall = new HackerContractCall('DELEGATECALL', caller, toAddress, 0, gasLimit, input, stateManager)
// >>>>>>> 16ad7aeaafc60970b0da4280b2307b026ebc6772
  this.nextcalls.push(nextcall)

  // hacker_call_hashs= append(hacker_call_hashs,hash)
  var hackerutils = new HackerUtils()
  hacker_call_hashs.push(hackerutils.Hash(nextcall))
  hacker_calls.push(nextcall)
  return nextcall
}

HackerContractCall.prototype.OnCallCode = function (caller, callee, gasLimit, input, txValue, stateManager) {
  this.OperationStack.push('CALLCODE')
// <<<<<<< HEAD
  this.StateStack.push(hackerState.newHackerState(stateManager.cache.get(caller), stateManager.cache.get(toAddress)))
  // var nextcall = new HackerContractCall('CALLCODE', caller, toAddress, txValue, gasPrice, txData, stateManager)
// =======
//   this.StateStack.push(stateManager)
  var nextcall = new HackerContractCall('CALLCODE', caller, callee, txValue, gasLimit, input, stateManager)
// >>>>>>> 16ad7aeaafc60970b0da4280b2307b026ebc6772
  this.nextcalls.push(nextcall)

  // hacker_call_hashs= append(hacker_call_hashs,hash)
  var hackerutils = new HackerUtils()
  hacker_call_hashs.push(hackerutils.Hash(nextcall))
  hacker_calls.push(nextcall)
  return nextcall
}

// fCorleone added these codes
HackerContractCall.prototype.OnDiv = function () {
  this.OperationStack.push('DIV')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnSDiv = function () {
  this.OperationStack.push('SDIV')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnRelationOp = function (opcode) {
  this.OperationStack.push(opcode)
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnSha3 = function () {
  this.OperationStack.push('SHA3')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnCaller = function () {
  this.OperationStack.push('CALLER')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnOrigin = function () {
  this.OperationStack.push('ORIGIN')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnCallValue = function () {
  this.OperationStack.push('CALLVALUE')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnCalldataLoad = function () {
  this.OperationStack.push('CALLDATALOAD')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.OnBlockHash = function () {
  this.OperationStack.push('BLOCKHASH')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.OnTimestamp = function () {
  this.OperationStack.push('TIMESTAMP')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.OnBalance = function () {
  this.OperationStack.push('BALANCE')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.OnNumber = function () {
  this.OperationStack.push('NUMBER')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.OnMload = function () {
  this.OperationStack.push('MLOAD')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.OnMstore = function () {
  this.OperationStack.push('MSTORE')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.OnSload = function () {
  this.OperationStack.push('SLOAD')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnSstore = function () {
  this.OperationStack.push('SSTORE')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnJump = function () {
  this.OperationStack.push('JUMP')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnJumpi = function () {
  this.OperationStack.push('JUMPI')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnGas = function () {
  this.OperationStack.push('GAS')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnCreate = function () {
  this.OperationStack.push('CREATE')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnSuicide = function () {
  this.OperationStack.push('SELFDESTRUCT')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}
HackerContractCall.prototype.OnReturn = function () {
  this.OperationStack.push('RETURN')
  this.StateStack.push(hackerState.newHackerState(this.stateManager.cache.get(this.caller), this.stateManager.cache.get(this.callee)))
}

HackerContractCall.prototype.hacker_close = function () {
  if (hacker_env != null || hacker_call_stack != null || (hacker_call_hashs != null && hacker_calls != null)) {
    // console.log('hacker_close...')
    while (hacker_call_stack.length > 0) {
      // console.log(hacker_call_stack[i])
      var call = hacker_call_stack.pop()
      call.OnCloseCall(0)
    }
    var root = 0

    var newhacker_call_hashs = hacker_call_hashs.slice(root)
    var newhacker_calls = hacker_calls.slice(root)

    var oracles = []
    var features = []

    var HackerExceptionDisorder = new oracle.HackerExceptionDisorder(hacker_call_hashs, hacker_calls)
    oracles.push(HackerExceptionDisorder)
    if (HackerExceptionDisorder.TestOracle()) {
      features.push(HackerExceptionDisorder.String())
    }
    // console.log('HackerExceptionDisorder: ' + HackerExceptionDisorder.TestOracle())

    var HackerRootCallFailed = new oracle.HackerRootCallFailed(hacker_call_hashs, hacker_calls)
    oracles.push(HackerRootCallFailed)
    if (HackerRootCallFailed.TestOracle()) {
      features.push(HackerRootCallFailed.String())
    }
    // console.log('HackerRootCallFailed: ' + HackerRootCallFailed.TestOracle())

    var HackerTimestampOp = new oracle.HackerTimestampOp(hacker_call_hashs, hacker_calls)
    oracles.push(HackerTimestampOp)
    if (HackerTimestampOp.TestOracle()) {
      features.push(HackerTimestampOp.String())
    }
    // console.log('HackerTimestampOp: ' + HackerTimestampOp.TestOracle())

    var HackerReentrancy = new oracle.HackerReentrancy(hacker_call_hashs, hacker_calls)
    oracles.push(HackerReentrancy)
    if (HackerReentrancy.TestOracle()) {
      features.push(HackerReentrancy.String())
    }
    // console.log('HackerReentrancy: ' + HackerReentrancy.TestOracle())

    var HackerRepeatedCall = new oracle.HackerRepeatedCall(hacker_call_hashs, hacker_calls)
    oracles.push(HackerRepeatedCall)
    if (HackerRepeatedCall.TestOracle()) {
      features.push(HackerRepeatedCall.String())
    }
    // console.log('HackerRepeatedCall: ' + HackerRepeatedCall.TestOracle())

    var HackerEtherTransfer = new oracle.HackerEtherTransfer(hacker_call_hashs, hacker_calls)
    oracles.push(HackerEtherTransfer)
    if (HackerEtherTransfer.TestOracle()) {
      features.push(HackerEtherTransfer.String())
    }
    // console.log('HackerEtherTransfer: ' + HackerEtherTransfer.TestOracle())

    var HackerEtherTransferFailed = new oracle.HackerEtherTransferFailed(hacker_call_hashs, hacker_calls)
    oracles.push(HackerEtherTransferFailed)
    if (HackerEtherTransferFailed.TestOracle()) {
      features.push(HackerEtherTransferFailed.String())
    }
    // console.log('HackerEtherTransferFailed: ' + HackerEtherTransferFailed.TestOracle())

    var HackerCallEtherTransferFailed = new oracle.HackerCallEtherTransferFailed(hacker_call_hashs, hacker_calls)
    oracles.push(HackerCallEtherTransferFailed)
    if (HackerCallEtherTransferFailed.TestOracle()) {
      features.push(HackerCallEtherTransferFailed.String())
    }
    // console.log('HackerCallEtherTransferFailed: ' + HackerCallEtherTransferFailed.TestOracle())

    var HackerGaslessSend = new oracle.HackerGaslessSend(hacker_call_hashs, hacker_calls)
    oracles.push(HackerGaslessSend)
    if (HackerGaslessSend.TestOracle()) {
      features.push(HackerGaslessSend.String())
    }
    // console.log('HackerGaslessSend: ' + HackerGaslessSend.TestOracle())

    var HackerDelegateCallInfo = new oracle.HackerDelegateCallInfo(hacker_call_hashs, hacker_calls)
    oracles.push(HackerDelegateCallInfo)
    if (HackerDelegateCallInfo.TestOracle()) {
      features.push(HackerDelegateCallInfo.String())
    }
    // console.log('HackerDelegateCallInfo: ' + HackerDelegateCallInfo.TestOracle())

    var HackerCallOpInfo = new oracle.HackerCallOpInfo(hacker_call_hashs, hacker_calls)
    oracles.push(HackerCallOpInfo)
    if (HackerCallOpInfo.TestOracle()) {
      features.push(HackerCallOpInfo.String())
    }
    // console.log('HackerCallOpInfo: ' + HackerCallOpInfo.TestOracle())

    var HackerSendOpInfo = new oracle.HackerSendOpInfo(hacker_call_hashs, hacker_calls)
    oracles.push(HackerSendOpInfo)
    if (HackerSendOpInfo.TestOracle()) {
      features.push(HackerSendOpInfo.String())
    }
    // console.log('HackerSendOpInfo: ' + HackerSendOpInfo.TestOracle())

    var HackerCallExecption = new oracle.HackerCallExecption(hacker_call_hashs, hacker_calls)
    oracles.push(HackerCallExecption)
    if (HackerCallExecption.TestOracle()) {
      features.push(HackerCallExecption.String())
    }
    // console.log('HackerCallExecption: ' + HackerCallExecption.TestOracle())

    var HackerUnknowCall = new oracle.HackerUnknowCall(hacker_call_hashs, hacker_calls)
    oracles.push(HackerUnknowCall)
    if (HackerUnknowCall.TestOracle()) {
      features.push(HackerUnknowCall.String())
    }
    // console.log('HackerUnknowCall: ' + HackerUnknowCall.TestOracle())

    var HackerNumberOp = new oracle.HackerNumberOp(hacker_call_hashs, hacker_calls)
    oracles.push(HackerNumberOp)
    if (HackerNumberOp.TestOracle()) {
      features.push(HackerNumberOp.String())
    }
    // console.log('HackerNumberOp: ' + HackerNumberOp.TestOracle())

    var HackerBlockHashOp = new oracle.HackerBlockHashOp(hacker_call_hashs, hacker_calls)
    oracles.push(HackerBlockHashOp)
    if (HackerBlockHashOp.TestOracle()) {
      features.push(HackerBlockHashOp.String())
    }
    // console.log('HackerBlockHashOp: ' + HackerBlockHashOp.TestOracle())

    var HackerStorageChanged = new oracle.HackerStorageChanged(hacker_call_hashs, hacker_calls)
    oracles.push(HackerStorageChanged)
    if (HackerStorageChanged.TestOracle()) {
      features.push(HackerStorageChanged.String())
    }
    // console.log('HackerStorageChanged: ' + HackerStorageChanged.TestOracle())

    // console.log('-------' + features.toString() + '--------')
    // for (var i = 0; i < oracles.length; i++) {
    //   var cur = oracles[i]
    // }
  }
  // release mem
  this.judgeOracle(oracles, features)
  hacker_env = null
  hacker_call_stack = null
  hacker_call_hashs = null
  hacker_calls = null
}

HackerContractCall.prototype.judgeOracle = function (oracles, features) {
  var isCallFailed = false
  var isStorageChanged = false
  var isCallOp = false
  var isCallException = false
  var isExceptionDisorder = false
  var isEtherTransfer = false
  var isEtherTransferFailed = false
  var isDelegate = false
  var isGaslessSend = false
  var isReentrancy = false
  var isCallEtherFailed = false
  var isRepeatedCall = false
  var isTimestamp = false
  var isBlockHash = false
  var isBlockNumber = false
  var isSendOp = false
  var isUnknowCall = false
  for (var i = 0; i < oracles.length; i++) {
    if (oracles[i].TestOracle() == true) {
      var retitem = oracles[i].String()

      if (retitem.indexOf('HackerRootCallFailed') >= 0) {
        isCallFailed = true
      }
      if (retitem.indexOf('HackerReentrancy') >= 0) {
        isReentrancy = true
      }
      if (retitem.indexOf('HackerRepeatedCall') >= 0) {
        isRepeatedCall = true
      }
      if (retitem.indexOf('HackerEtherTransfer') >= 0) {
        isEtherTransfer = true
      }
      if (retitem.indexOf('HackerEtherTransferFailed') >= 0) {
        isEtherTransferFailed = true
      }
      if (retitem.indexOf('HackerCallEtherTransferFailed') >= 0) {
        isCallEtherFailed = true
      }
      if (retitem.indexOf('HackerGaslessSend') >= 0) {
        isGaslessSend = true
      }
      if (retitem.indexOf('HackerDelegateCallInfo') >= 0) {
        isDelegate = true
      }

      if (retitem.indexOf('HackerExceptionDisorder') >= 0) {
        isExceptionDisorder = true
      }
      if (retitem.indexOf('HackerSendOpInfo') >= 0) {
        isSendOp = true
      }
      if (retitem.indexOf('HackerCallOpInfo') >= 0) {
        isCallOp = true
      }
      if (retitem.indexOf('HackerCallException') >= 0) {
        isCallException = true
      }
      if (retitem.indexOf('HackerUnknownCall') >= 0) {
        isUnknowCall = true
      }
      if (retitem.indexOf('HackerStorageChanged') >= 0) {
        isStorageChanged = true
      }
      if (retitem.indexOf('HackerTimestampOp') >= 0) {
        isTimestamp = true
      }
      if (retitem.indexOf('HackerBlockHashOp') >= 0) {
        isBlockHash = true
      }
      if (retitem.indexOf('HackerNumberOp') >= 0) {
        isBlockNumber = true
      }
    }
  }
  if (isReentrancy && (isStorageChanged || isEtherTransfer || isSendOp)) {
    console.log('Reentrancybug'.red)
    console.log(features.toString())
  }
  if (isExceptionDisorder) {
    console.log('ExceptionDisorderbug'.red)
    console.log(features.toString())
  }
  if (isDelegate) {
    console.log('Delegatebug'.red)
    console.log(features.toString())
  }
  if (isGaslessSend) {
    console.log('GaslessSendbug'.red)
    console.log(features.toString())
  }
  if (isTimestamp && (isStorageChanged || isEtherTransfer || isSendOp)) {
    console.log('Timestampbug'.red)
    console.log(features.toString())
  }
  if (isBlockNumber && (isStorageChanged || isEtherTransfer || isSendOp)) {
    console.log('BlockNumberbug'.red)
    console.log(features.toString())
  }
}

HackerContractCall.prototype.isBrother = function (callindex, callA) {
  var father = this.findFather(callindex)
  if (father == null) {
    return false
  }
  return father.isAncestor(callA)
}
HackerContractCall.prototype.findFather = function (index) {
  for (var i = index - 1; i >= 0; i--) {
    if (this.hacker_calls[i].isAncestor(this)) {
      return this.hacker_calls[i]
    }
  }
  return null
}
HackerContractCall.prototype.isAncestor = function (callA) {
  for (var i = 0; i < this.nextcalls.length; i++) {
    if (this.nextcalls[i] == callA) {
      return true
    }
    if (this.nextcalls[i].isAncestor(callA) == true) {
      return true
    }
  }
  return false
}
