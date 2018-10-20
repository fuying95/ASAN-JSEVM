const Buffer = require('safe-buffer').Buffer
const oracle = require('./hackerOracle')
const HackerExceptionDisorder = oracle.HackerExceptionDisorder
const HackerRootCallFailed = oracle.HackerRootCallFailed

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
  console.log('\ncall@ Closed')
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

HackerContractCall.prototype.hacker_close = function () {
  if (hacker_env != null || hacker_call_stack != null) {
    console.log('hacker_close...')
    while (hacker_call_stack.length > 0) {
      // console.log(hacker_call_stack[i])
      var call = hacker_call_stack.pop()
      call.OnCloseCall(0)
    }
    var oracles = []
    var HackerRootCallFailed = new oracle.HackerRootCallFailed([], [])
    oracles.push()
  }
  // 释放空间
  hacker_env = null
  hacker_call_stack = null
  hacker_call_hashs = null
  hacker_calls = null
}

// fCorleone added these codes
HackerContractCall.prototype.OnDiv = function () {
  this.OperationStack.push('DIV');
}
HackerContractCall.prototype.OnSDiv = function () {
  this.OperationStack.push('SDIV');
}
HackerContractCall.prototype.OnRelationOp = function (opcode) {
  this.OperationStack.push(opcode);
}
HackerContractCall.prototype.OnSha3 = function () {
  this.OperationStack.push('SHA3');
}
HackerContractCall.prototype.OnCaller = function () {
  this.OperationStack.push('CALLER');
}
HackerContractCall.prototype.OnOrigin = function () {
  this.OperationStack.push('ORIGIN');
}
HackerContractCall.prototype.OnCallValue = function () {
  this.OperationStack.push('CALLVALUE');
}
HackerContractCall.prototype.OnCalldataLoad = function () {
  this.OperationStack.push('CALLDATALOAD');
}

HackerContractCall.prototype.OnBlockHash = function () {
  this.OperationStack.push('BLOCKHASH');
}

HackerContractCall.prototype.OnTimestamp = function () {
  this.OperationStack.push('TIMESTAMP');
}

HackerContractCall.prototype.OnBalance = function () {
  this.OperationStack.push('BALANCE');
}

HackerContractCall.prototype.OnNumber = function () {
  this.OperationStack.push('NUMBER');
}

HackerContractCall.prototype.OnMload = function () {
  this.OperationStack.push('MLOAD');
}

HackerContractCall.prototype.OnMstore = function () {
  this.OperationStack.push('MSTORE');
}

HackerContractCall.prototype.OnSload = function () {
  this.OperationStack.push('SLOAD');
}
HackerContractCall.prototype.OnSstore = function () {
  this.OperationStack.push('SSTORE');
}
HackerContractCall.prototype.OnJump = function () {
  this.OperationStack.push('JUMP');
}
HackerContractCall.prototype.OnJumpi = function () {
  this.OperationStack.push('JUMPI');
}
HackerContractCall.prototype.OnGas = function () {
  this.OperationStack.push('GAS');
}
HackerContractCall.prototype.OnCreate = function () {
  this.OperationStack.push('CREATE');
}
HackerContractCall.prototype.OnSuicide = function () {
  this.OperationStack.push('SELFDESTRUCT');
}
HackerContractCall.prototype.OnReturn = function () {
  this.OperationStack.push('RETURN');
}

