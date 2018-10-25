/**
 this file is used to define a new state struct
 ***************************************
 Created By fCorleone 19th October, 2018
 ***************************************
 */
module.exports = HackerState
function HackerState () {
  this.contracts = [] // It's a Hacker_ContractState type array
}

function Hacker_ContractState (storage, balance) {
  this.storage = storage
  this.balance = balance
}
HackerState.prototype.newHacker_ContractState = function (storage, balance) {
  var newHackerContractState = new Hacker_ContractState(storage, balance)
  return newHackerContractState
}

HackerState.prototype.newHackerState = function (callerAccount, calleeAccount) {
  var newState = new HackerState()
  var callerState = this.newHacker_ContractState(callerAccount.stateRoot, callerAccount.balance)
  var calleeState = this.newHacker_ContractState(calleeAccount.stateRoot, calleeAccount.balance)
  newState.contracts.push(callerState)
  newState.contracts.push(calleeState)
  return newState
}

// if they are the same, return true else return false
HackerState.prototype.CmpHackerState = function (state, other) {
  for (var i = 0; i < state.contracts.length; i++){
    var judge = this.CmpHackerContractState(state.contracts[i], other.contracts[i])
    if (judge !== true) {
      return false
    }
  }
}

// if they are the same, return true else return false
HackerState.prototype.CmpHackerContractState = function (state, other) {
  var s1 = state.storage
  var s2 = other.storage
  var b1 = state.balance
  var b2 = state.balance
  if (b1 !== b2) {
    // if the balance has been changed
    // TODO: tell this is a balance changed
    return false
  }

}
