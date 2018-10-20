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
function HackerRecord(){

}
HackerRecord.prototype.Hacker_record = function (opname){
    var hacker_call_stack = hackercontractcall.get_hacker_call_stack()
    if (hacker_call_stack != null){
        // if the call stack is exsiting;
        var call = hacker_call_stack[hacker_call_stack.length-1]
        if (call != null) {
            switch (opname) {
                case 'DIV':
                    call.OnDiv();
                case 'SDIV':
                    call.OnSDiv();
                case 'NOT':
                    call.OnRelationOp('NOT');
                case 'LT':
                    call.OnRelationOp('LT');
                case 'GT':
                    call.OnRelationOp('GT');
                case 'SLT':
                    call.OnRelationOp('SLT');
                case 'SGT':
                    call.OnRelationOp('SGT');
                case 'EQ':
                    call.OnRelationOp('EQ');
                case 'ISZERO':
                    call.OnRelationOp('ISZERO');
                case 'AND':
                    call.OnRelationOp('AND');
                case 'OR':
                    call.OnRelationOp('OR');
                case 'XOR':
                    call.OnRelationOp('XOR');
                case 'SHA3':
                    call.OnSha3();
                case 'CALLER':
                    call.OnCaller();
                case 'ORIGIN':
                    call.OnOrigin();
                case 'CALLVALUE':
                    call.OnCallValue();
                case 'CALLDATALOAD':
                    call.OnCalldataLoad();
                case 'BLOCKHASH':
                    call.OnBlockHash();
                case 'TIMESTAMP':
                    call.OnTimestamp();
                case 'BALANCE':
                    call.OnBalance();
                case 'NUMBER':
                    call.OnNumber();
                case 'MLOAD':
                    call.OnMload();
                case 'MSTORE':
                    call.OnMstore();
                case 'SLOAD':
                    call.OnSload();
                case 'SSTORE':
                    call.OnSstore();
                case 'JUMP':
                    call.OnJump();
                case 'JUMPI':
                    call.OnJumpi();
                case 'GAS':
                    call.OnGas();
                case 'CREATE':
                    call.OnCreate();
                case 'CALL':
                    break;
                case 'CALLCODE':
                    break;
                case 'DELEGATECALL':
                    break;
                case 'SELFDESTRUCT':
                    call.OnSuicide();
                case 'RETURN':
                    call.OnReturn();
                default:
                    break;
            }
        }
    }
}