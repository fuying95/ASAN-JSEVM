/**
 this file is used to define some useful functions to support hacker
 ***************************************
 Created By fCorleone 20th October, 2018
 ***************************************
 */
const ethUtil = require('ethereumjs-util')

module.exports = HackerUtils
function HackerUtils () {

}
// hash a call , the parameter input is a HackerContractCall type
HackerUtils.prototype.Hash = function (call) {
  // var hash1 = ethUtil.sha3(call.caller)
  // var hash2 = ethUtil.sha3(call.callee)
  // // console.log('hash1 is : ', hash1)
  // var hash3 = ethUtil.sha3(call.input[0])
  // var hash4 = ethUtil.sha3(call.input[input.length - 1])
  var hash1 = ethUtil.sha256(call.caller.toString('hex'))
  var hash2 = ethUtil.sha256(call.callee.toString('hex'))
  // console.log('hash1 is : ', hash1)
  if (call.input != null) {
    var hash3 = ethUtil.sha256(call.input[0])
    var hash4 = ethUtil.sha256(call.input[call.input.length - 1])
  } else {
    var hash3 = ''
    var hash4 = ''
  }

  var hash = hash1.toString() + hash2.toString() + hash3.toString() + hash4.toString()
  return hash
}
