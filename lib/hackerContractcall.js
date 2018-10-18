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






function HackerContractCall(operation , caller, callee ,
  value, gas , input){
  this.isInitCall=false
  this.caller=caller
  this.callee=callee
  this.value=value
  this.gas=gas
  this.finalgas=0
  this.input=input
  this.nextcalls=new Array() // type:HackerContractCall
  this.OperationStack=[operation]
  //TODO
  // var initState = newHackerState(caller, callee)
  // this.StateStack=[initState]
  this.throwException=false
  this.errOutGas=false
  this.errOutBalance=false
  this.snapshotId=0
  this.nextRevisionId=0

}

HackerContractCall.prototype.initHacker= function (stateManager,hackerrunCodeOpts) {
  if(hacker_env==null || hacker_call_stack==null){
    hacker_env=stateManager;
    hacker_call_stack=new Array();
    // ??? hackercallhash???
    // hacker_call_hashs = make([]common.Hash,0,0)
    hacker_calls = new Array(); //type:HackerContractCall
    var initCall = new HackerContractCall("STARTRECORD", hackerrunCodeOpts.caller, hackerrunCodeOpts.address, hackerrunCodeOpts.value, hackerrunCodeOpts.gasPrice, hackerrunCodeOpts.data)
    initCall.isInitCall = true
    hacker_call_stack.push(initCall)

  }

}

HackerContractCall.prototype.get_hacker_call_stack = function () {
  return hacker_call_stack
}

HackerContractCall.prototype.OnCall = function (caller, toAddress, gasPrice, txData) {
  this.OperationStack.push("CALL")
  // this.StateStack.push(newHackerState(_caller.Address(), _callee))
  var nextcall=new HackerContractCall()
  this.nextcalls.push(nextcall)

  //hacker_call_hashs= append(hacker_call_hashs,hash)
  hacker_calls.push(nextcall)
  return nextcall
}


