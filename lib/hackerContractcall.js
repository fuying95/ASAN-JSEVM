const Buffer = require('safe-buffer').Buffer
const oracle = require('./hackerOracle')
const HackerUtils = require('./hackerUtils.js')

/**
 *
 *
 * */

module.exports = HackerContractCall
var hacker_env
var hacker_call_stack
var hacker_call_hashs
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
  this.StateStack = [stateManager]
  // this.stateManager=stateManager
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
    var initCall = new HackerContractCall('STARTRECORD', hackerrunCodeOpts.caller, hackerrunCodeOpts.address, hackerrunCodeOpts.value, hackerrunCodeOpts.gasPrice, hackerrunCodeOpts.data, stateManager)
    initCall.isInitCall = true
    hacker_call_stack.push(initCall)
  }
}

HackerContractCall.prototype.get_hacker_call_stack = function () {
  return hacker_call_stack
}

HackerContractCall.prototype.OnCloseCall = function (finalgas, stateManager) {
  this.finalgas = finalgas // gas used
  this.OperationStack.push('RETURN')
  this.StateStack.push(stateManager)
  console.log('\ncall@ Closed')
  // fmt.Printf("\ncall@%pClosed",call)
}

HackerContractCall.prototype.OnCall = function (caller, toAddress, gasPrice, txData, txValue, stateManager) {
  this.OperationStack.push('CALL')
  this.StateStack.push(stateManager)
  // this.StateStack.push(newHackerState(_caller.Address(), _callee))
  var nextcall = new HackerContractCall('CALL', caller, toAddress, txValue, gasPrice, txData, stateManager)
  this.nextcalls.push(nextcall)

  // hacker_call_hashs= append(hacker_call_hashs,hash)
  var hackerutils = new HackerUtils()
  hacker_call_hashs.push(hackerutils.Hash(nextcall))
  hacker_calls.push(nextcall)
  return nextcall
}

HackerContractCall.prototype.OnDelegateCall = function (caller, toAddress, gasPrice, txData, stateManager) {
  this.OperationStack.push('DELEGATECALL')
  this.StateStack.push(stateManager)
  var nextcall = new HackerContractCall('DELEGATECALL', caller, toAddress, 0, gasPrice, txData, stateManager)
  this.nextcalls.push(nextcall)

  // hacker_call_hashs= append(hacker_call_hashs,hash)
  var hackerutils = new HackerUtils()
  hacker_call_hashs.push(hackerutils.Hash(nextcall))
  hacker_calls.push(nextcall)
  return nextcall
}

HackerContractCall.prototype.OnCallCode = function (caller, toAddress, gasPrice, txData, txValue, stateManager) {
  this.OperationStack.push('CALLCODE')
  this.StateStack.push(stateManager)
  var nextcall = new HackerContractCall('CALLCODE', caller, toAddress, txValue, gasPrice, txData, stateManager)
  this.nextcalls.push(nextcall)

  // hacker_call_hashs= append(hacker_call_hashs,hash)
  var hackerutils = new HackerUtils()
  hacker_call_hashs.push(hackerutils.Hash(nextcall))
  hacker_calls.push(nextcall)
  return nextcall
}

HackerContractCall.prototype.hacker_close = function () {
  if (hacker_env != null || hacker_call_stack != null || (hacker_call_hashs != null && hacker_calls != null)) {
    console.log('hacker_close...')
    while (hacker_call_stack.length > 0) {
      // console.log(hacker_call_stack[i])
      var call = hacker_call_stack.pop()
      call.OnCloseCall(0)
    }
    var root = 1

    var newhacker_call_hashs = hacker_call_hashs.slice(root)
    var newhacker_calls = hacker_calls.slice(root)

    var oracles = []
    var features = []

    var HackerExceptionDisorder = new oracle.HackerExceptionDisorder(hacker_call_hashs, hacker_calls)
    oracles.push(HackerExceptionDisorder)
    if (HackerExceptionDisorder.TestOracle()) {
      features.push(HackerExceptionDisorder.String())
    }
    console.log('HackerExceptionDisorder: ' + HackerExceptionDisorder.TestOracle())

    var HackerRootCallFailed = new oracle.HackerRootCallFailed(hacker_call_hashs, hacker_calls)
    oracles.push(HackerRootCallFailed)
    if (HackerRootCallFailed.TestOracle()) {
      features.push(HackerRootCallFailed.String())
    }
    console.log('HackerRootCallFailed: ' + HackerRootCallFailed.TestOracle())

    var HackerTimestampOp = new oracle.HackerTimestampOp(hacker_call_hashs, hacker_calls)
    oracles.push(HackerTimestampOp)
    if (HackerTimestampOp.TestOracle()) {
      features.push(HackerTimestampOp.String())
    }
    console.log('HackerTimestampOp: ' + HackerTimestampOp.TestOracle())

    var HackerReentrancy = new oracle.HackerReentrancy(hacker_call_hashs, hacker_calls)
    oracles.push(HackerReentrancy)
    if (HackerReentrancy.TestOracle()) {
      features.push(HackerReentrancy.String())
    }
    console.log('HackerReentrancy: ' + HackerReentrancy.TestOracle())

    var HackerRepeatedCall = new oracle.HackerRepeatedCall(hacker_call_hashs, hacker_calls)
    oracles.push(HackerRepeatedCall)
    if (HackerRepeatedCall.TestOracle()) {
      features.push(HackerRepeatedCall.String())
    }
    console.log('HackerRepeatedCall: ' + HackerRepeatedCall.TestOracle())

    var HackerEtherTransfer = new oracle.HackerEtherTransfer(hacker_call_hashs, hacker_calls)
    oracles.push(HackerEtherTransfer)
    if (HackerEtherTransfer.TestOracle()) {
      features.push(HackerEtherTransfer.String())
    }
    console.log('HackerEtherTransfer: ' + HackerEtherTransfer.TestOracle())

    var HackerEtherTransferFailed = new oracle.HackerEtherTransferFailed(hacker_call_hashs, hacker_calls)
    oracles.push(HackerEtherTransferFailed)
    if (HackerEtherTransferFailed.TestOracle()) {
      features.push(HackerEtherTransferFailed.String())
    }
    console.log('HackerEtherTransferFailed: ' + HackerEtherTransferFailed.TestOracle())

    var HackerCallEtherTransferFailed = new oracle.HackerCallEtherTransferFailed(hacker_call_hashs, hacker_calls)
    oracles.push(HackerCallEtherTransferFailed)
    if (HackerCallEtherTransferFailed.TestOracle()) {
      features.push(HackerCallEtherTransferFailed.String())
    }
    console.log('HackerCallEtherTransferFailed: ' + HackerCallEtherTransferFailed.TestOracle())

    var HackerGaslessSend = new oracle.HackerGaslessSend(hacker_call_hashs, hacker_calls)
    oracles.push(HackerGaslessSend)
    if (HackerGaslessSend.TestOracle()) {
      features.push(HackerGaslessSend.String())
    }
    console.log('HackerGaslessSend: ' + HackerGaslessSend.TestOracle())

    var HackerDelegateCallInfo = new oracle.HackerDelegateCallInfo(hacker_call_hashs, hacker_calls)
    oracles.push(HackerDelegateCallInfo)
    if (HackerDelegateCallInfo.TestOracle()) {
      features.push(HackerDelegateCallInfo.String())
    }
    console.log('HackerDelegateCallInfo: ' + HackerDelegateCallInfo.TestOracle())

    var HackerCallOpInfo = new oracle.HackerCallOpInfo(hacker_call_hashs, hacker_calls)
    oracles.push(HackerCallOpInfo)
    if (HackerCallOpInfo.TestOracle()) {
      features.push(HackerCallOpInfo.String())
    }
    console.log('HackerCallOpInfo: ' + HackerCallOpInfo.TestOracle())

    var HackerSendOpInfo = new oracle.HackerSendOpInfo(hacker_call_hashs, hacker_calls)
    oracles.push(HackerSendOpInfo)
    if (HackerSendOpInfo.TestOracle()) {
      features.push(HackerSendOpInfo.String())
    }
    console.log('HackerSendOpInfo: ' + HackerSendOpInfo.TestOracle())

    var HackerCallExecption = new oracle.HackerCallExecption(hacker_call_hashs, hacker_calls)
    oracles.push(HackerCallExecption)
    if (HackerCallExecption.TestOracle()) {
      features.push(HackerCallExecption.String())
    }
    console.log('HackerCallExecption: ' + HackerCallExecption.TestOracle())

    var HackerUnknowCall = new oracle.HackerUnknowCall(hacker_call_hashs, hacker_calls)
    oracles.push(HackerUnknowCall)
    if (HackerUnknowCall.TestOracle()) {
      features.push(HackerUnknowCall.String())
    }
    console.log('HackerUnknowCall: ' + HackerUnknowCall.TestOracle())

    var HackerNumberOp = new oracle.HackerNumberOp(hacker_call_hashs, hacker_calls)
    oracles.push(HackerNumberOp)
    if (HackerNumberOp.TestOracle()) {
      features.push(HackerNumberOp.String())
    }
    console.log('HackerNumberOp: ' + HackerNumberOp.TestOracle())

    var HackerBlockHashOp = new oracle.HackerBlockHashOp(hacker_call_hashs, hacker_calls)
    oracles.push(HackerBlockHashOp)
    if (HackerBlockHashOp.TestOracle()) {
      features.push(HackerBlockHashOp.String())
    }
    console.log('HackerBlockHashOp: ' + HackerBlockHashOp.TestOracle())

    console.log(features.toString())
    for (var i = 0; i < oracles.length; i++) {
      var cur = oracles[i]

    }
  }
  // release mem
  hacker_env = null
  hacker_call_stack = null
  hacker_call_hashs = null
  hacker_calls = null
}

// fCorleone added these codes
HackerContractCall.prototype.OnDiv = function () {
  this.OperationStack.push('DIV')
}
HackerContractCall.prototype.OnSDiv = function () {
  this.OperationStack.push('SDIV')
}
HackerContractCall.prototype.OnRelationOp = function (opcode) {
  this.OperationStack.push(opcode)
}
HackerContractCall.prototype.OnSha3 = function () {
  this.OperationStack.push('SHA3')
}
HackerContractCall.prototype.OnCaller = function () {
  this.OperationStack.push('CALLER')
}
HackerContractCall.prototype.OnOrigin = function () {
  this.OperationStack.push('ORIGIN')
}
HackerContractCall.prototype.OnCallValue = function () {
  this.OperationStack.push('CALLVALUE')
}
HackerContractCall.prototype.OnCalldataLoad = function () {
  this.OperationStack.push('CALLDATALOAD')
}

HackerContractCall.prototype.OnBlockHash = function () {
  this.OperationStack.push('BLOCKHASH')
}

HackerContractCall.prototype.OnTimestamp = function () {
  this.OperationStack.push('TIMESTAMP')
}

HackerContractCall.prototype.OnBalance = function () {
  this.OperationStack.push('BALANCE')
}

HackerContractCall.prototype.OnNumber = function () {
  this.OperationStack.push('NUMBER')
}

HackerContractCall.prototype.OnMload = function () {
  this.OperationStack.push('MLOAD')
}

HackerContractCall.prototype.OnMstore = function () {
  this.OperationStack.push('MSTORE')
}

HackerContractCall.prototype.OnSload = function () {
  this.OperationStack.push('SLOAD')
}
HackerContractCall.prototype.OnSstore = function () {
  this.OperationStack.push('SSTORE')
}
HackerContractCall.prototype.OnJump = function () {
  this.OperationStack.push('JUMP')
}
HackerContractCall.prototype.OnJumpi = function () {
  this.OperationStack.push('JUMPI')
}
HackerContractCall.prototype.OnGas = function () {
  this.OperationStack.push('GAS')
}
HackerContractCall.prototype.OnCreate = function () {
  this.OperationStack.push('CREATE')
}
HackerContractCall.prototype.OnSuicide = function () {
  this.OperationStack.push('SELFDESTRUCT')
}
HackerContractCall.prototype.OnReturn = function () {
  this.OperationStack.push('RETURN')
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
