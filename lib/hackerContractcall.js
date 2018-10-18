const Buffer = require('safe-buffer').Buffer

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
  // var initState = newHackerState(caller, callee)
  // HackerState用statemanager替代了
  this.StateStack = [stateManager]
  // this.stateManager=stateManager
  this.throwException = false
  this.errOutGas = false
  this.errOutBalance = false
  this.snapshotId = 0
  this.nextRevisionId = 0
}

HackerContractCall.prototype.initHacker = function (stateManager, hackerrunCodeOpts) {
  if (hacker_env == null || hacker_call_stack == null) {
    hacker_env = stateManager
    hacker_call_stack = []
    // ??? hackercallhash???
    // hacker_call_hashs = make([]common.Hash,0,0)
    hacker_calls = [] // type:HackerContractCall
    var initCall = new HackerContractCall('STARTRECORD', hackerrunCodeOpts.caller, hackerrunCodeOpts.address, hackerrunCodeOpts.value, hackerrunCodeOpts.gasPrice, hackerrunCodeOpts.data, stateManager)
    initCall.isInitCall = true
    hacker_call_stack.push(initCall)
  }
}

HackerContractCall.prototype.hacker_close = function () {
  if (hacker_env != null || hacker_call_stack != null) {

  }
}

HackerContractCall.prototype.get_hacker_call_stack = function () {
  return hacker_call_stack
}

HackerContractCall.prototype.OnCall = function (caller, toAddress, gasPrice, txData, txValue, stateManager) {
  this.OperationStack.push('CALL')
  this.StateStack.push(stateManager)
  // this.StateStack.push(newHackerState(_caller.Address(), _callee))
  var nextcall = new HackerContractCall('CALL', caller, toAddress, txValue, gasPrice, txData, stateManager)
  this.nextcalls.push(nextcall)
  // hacker_call_hashs= append(hacker_call_hashs,hash)
  hacker_calls.push(nextcall)
  return nextcall
}

HackerContractCall.prototype.OnCloseCall = function (finalgas, stateManager) {
  this.finalgas = finalgas
  this.OperationStack.push('RETURN')
  this.StateStack.push(stateManager)
  // this.StateStack.push(newHackerState(_caller.Address(), _callee))
  console.log('\ncall@%pClosed')
  // fmt.Printf("\ncall@%pClosed",call)
}

HackerContractCall.prototype.OnDelegateCall = function (caller, toAddress, gasPrice, txData, stateManager) {
  this.OperationStack.push('DELEGATECALL')
  this.StateStack.push(stateManager)
  // this.StateStack.push(newHackerState(_caller.Address(), _callee))
  var nextcall = new HackerContractCall('DELEGATECALL', caller, toAddress, 0, gasPrice, txData, stateManager)
  this.nextcalls.push(nextcall)
  // hacker_call_hashs= append(hacker_call_hashs,hash)
  hacker_calls.push(nextcall)
  return nextcall
}
