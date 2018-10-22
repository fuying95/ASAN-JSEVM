/**
this file is used to record the call in the hacker_call_stack ,
and we will use the onCall function to record each opcodes in a stack
***************************************
Created By fCorleone 19th October, 2018
***************************************
 */
const HackerContractCall = require('./hackerContractcall.js')
module.exports = HackerRecord

// get the hackercontractcall object to get hacker_call_stack object;
var hackercontractcall = new HackerContractCall()
function HackerRecord () {

}
HackerRecord.prototype.Hacker_record = function (opname) {
  var hacker_call_stack = hackercontractcall.get_hacker_call_stack()
  if (hacker_call_stack != null) {
        // if the call stack is exsiting;
    var call = hacker_call_stack[hacker_call_stack.length - 1]
    if (call != null) {
      switch (opname) {
        case 'DIV':
          call.OnDiv()
          break
        case 'SDIV':
          call.OnSDiv()
          break
        case 'NOT':
          call.OnRelationOp('NOT')
          break
        case 'LT':
          call.OnRelationOp('LT')
          break
        case 'GT':
          call.OnRelationOp('GT')
          break
        case 'SLT':
          call.OnRelationOp('SLT')
          break
        case 'SGT':
          call.OnRelationOp('SGT')
          break
        case 'EQ':
          call.OnRelationOp('EQ')
          break
        case 'ISZERO':
          call.OnRelationOp('ISZERO')
          break
        case 'AND':
          call.OnRelationOp('AND')
          break
        case 'OR':
          call.OnRelationOp('OR')
          break
        case 'XOR':
          call.OnRelationOp('XOR')
          break
        case 'SHA3':
          call.OnSha3()
          break
        case 'CALLER':
          call.OnCaller()
          break
        case 'ORIGIN':
          call.OnOrigin()
          break
        case 'CALLVALUE':
          call.OnCallValue()
          break
        case 'CALLDATALOAD':
          call.OnCalldataLoad()
          break
        case 'BLOCKHASH':
          call.OnBlockHash()
          break
        case 'TIMESTAMP':
          call.OnTimestamp()
          break
        case 'BALANCE':
          call.OnBalance()
          break
        case 'NUMBER':
          call.OnNumber()
          break
        case 'MLOAD':
          call.OnMload()
          break
        case 'MSTORE':
          call.OnMstore()
          break
        case 'SLOAD':
          call.OnSload()
          break
        case 'SSTORE':
          call.OnSstore()
          break
        case 'JUMP':
          call.OnJump()
          break
        case 'JUMPI':
          call.OnJumpi()
          break
        case 'GAS':
          call.OnGas()
          break
        case 'CREATE':
          call.OnCreate()
          break
        case 'CALL':
          break
        case 'CALLCODE':
          break
        case 'DELEGATECALL':
          break
        case 'SELFDESTRUCT':
          call.OnSuicide()
          break
        case 'RETURN':
          call.OnReturn()
          break
        default:
          break
      }
    }
  }
}
