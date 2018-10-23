function HackerRootCallFailed (hacker_call_hashs, hacker_calls) {
  var HackerRootCallFailed = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls

  }
  return HackerRootCallFailed
}
var HackerRootCallFailedproto = HackerRootCallFailed.prototype

HackerRootCallFailedproto.TestOracle = function () {
  var rootCall = HackerRootCallFailedproto.hacker_calls[0]
  return rootCall.throwException
}
HackerRootCallFailedproto.String = function () {
  return 'HackerRootCallFailed'
}

function HackerReentrancy (hacker_call_hashs, hacker_calls) {
  var HackerReentrancy = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls,
    repeatedPairs: [][2],
    feauture: ''

  }
  return HackerReentrancy
}
var HackerReentrancyproto = HackerReentrancy.prototype

HackerReentrancyproto.TestOracle = function () {
  var hasReen = false
  var i = 0
  var j
  var hash1 = HackerReentrancyproto.hacker_call_hashs[i]
  for (j = i + 1; j < HackerReentrancyproto.hacker_call_hashs.length; j++) {
    var hash2 = HackerReentrancyproto.hacker_call_hashs[j]
    // compare two call hash equal?
    // compare two call operationLen equal? detect anti-reentrancy protection
    // if strings.Compare(hash1.String(),hash2.String()) == 0&&oracle.hacker_calls[i].OperationStack.len()<=oracle.hacker_calls[j].OperationStack.len()&&
    // 	(oracle.hacker_calls[i].isAncestor(oracle.hacker_calls[j]) || oracle.hacker_calls[j].isAncestor(oracle.hacker_calls[i])){
    if (hash1.toString() === hash2.toString()) {
      if (HackerReentrancyproto.hacker_calls[i].OperationStack.len() <= HackerReentrancyproto.hacker_calls[j].OperationStack.len()) {
        HackerReentrancyproto.feauture = 'le'
      } else {
        HackerReentrancyproto.feauture = 'anti-reentrancy'
      }
      var repeatedPair = [HackerReentrancyproto.hacker_calls[i], HackerReentrancyproto.hacker_calls[j]]
      HackerReentrancyproto.repeatedPairs.push(repeatedPair)
      hasReen = true
    }
  }
  return hasReen
}
HackerReentrancyproto.String = function () {
  return 'HackerReentrancy' + HackerReentrancyproto.feauture
}

function HackerRepeatedCall (hacker_call_hashs, hacker_calls) {
  var HackerRepeatedCall = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls,
    repeatedPairs: [][2]

  }
  return HackerRepeatedCall
}
var HackerRepeatedCallproto = HackerRepeatedCall.prototype

HackerRepeatedCallproto.TestOracle = function () {
  var hasRepeated = false
  // nextcalls_len := len(oracle.hacker_calls[0].nextcalls)
  for (var i = 0; i < HackerRepeatedCallproto.hacker_call_hashs.length; i++) {
    var hash1 = HackerRepeatedCallproto.hacker_call_hashs[i]
    for (var j = i + 1; j < HackerRepeatedCallproto.hacker_call_hashs.length; j++) {
      var hash2 = HackerRepeatedCallproto.hacker_call_hashs[j]
      if (hash1.toString() === hash2.toString() && (HackerRepeatedCallproto.hacker_calls[i].isBrother(i, HackerRepeatedCallproto.hacker_calls[j]))) {
        var repeatedPair = [HackerRepeatedCallproto.hacker_calls[i], HackerRepeatedCallproto.hacker_calls[j]]
        HackerRepeatedCallproto.repeatedPairs.push(repeatedPair)
        hasRepeated = true
      }
    }
  }
  return hasRepeated
}
HackerRepeatedCallproto.String = function () {
  return 'HackerRepeatedCall'
}

function HackerEtherTransfer (hacker_call_hashs, hacker_calls) {
  var HackerEtherTransfer = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls,
    hacker_exception_calls: []

  }
  return HackerEtherTransfer
}
var HackerEtherTransferproto = HackerEtherTransfer.prototype

HackerEtherTransferproto.TestOracle = function () {
  var ret = false
  // if oracle.triggerOracle(oracle.hacker_calls[0]){
  // 	oracle.hacker_exception_calls = append(oracle.hacker_exception_calls, oracle.hacker_calls[0])
  // 	ret = true
  // }
  var calls = HackerEtherTransferproto.hacker_calls[0].nextcalls
  for (var i = 0; i < calls.length; i++) {
    var call = calls[i]
    if (HackerEtherTransferproto.triggerOracle(call)) {
      HackerEtherTransferproto.hacker_exception_calls.push(call)
      ret = true
    }
  }
  return ret
}
HackerEtherTransferproto.triggerOracle = function (call) {
  var nextcalls = call.nextcalls
  for (var i = 0; i < nextcalls.length; i++) {
    var n_call = nextcalls[i]
    if (n_call.value > 0) {
      return true
    }
  }

  return call.value > 0
}

HackerEtherTransferproto.String = function () {
  return 'HackerEtherTransfer'
}

function HackerEtherTransferFailed (hacker_call_hashs, hacker_calls) {
  var HackerEtherTransferFailed = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls,
    hacker_exception_calls: []

  }
  return HackerEtherTransferFailed
}
var HackerEtherTransferFailedproto = HackerEtherTransferFailed.prototype

HackerEtherTransferFailedproto.TestOracle = function () {
  var ret = false
  if (HackerEtherTransferFailedproto.triggerOracle(HackerEtherTransferFailedproto.hacker_calls[0])) {
    HackerEtherTransferFailedproto.hacker_exception_calls.push(HackerEtherTransferFailedproto.hacker_calls[0])
  }
  var calls = HackerEtherTransferFailedproto.hacker_calls[0].nextcalls
  for (var i = 0; i < calls.length; i++) {
    var call = calls[i]
    if (HackerEtherTransferFailedproto.triggerOracle(call)) {
      HackerEtherTransferFailedproto.hacker_exception_calls.push(call)
      ret = true
    }
  }

  return ret
}
HackerEtherTransferFailedproto.triggerOracle = function (call) {
  return (call.value > 0 || call.OperationStack.toString().indexOf('BALANCE')) && call.throwException
}

HackerEtherTransferFailedproto.String = function () {
  return 'HackerEtherTransferFailed'
}

function HackerCallEtherTransferFailed (hacker_call_hashs, hacker_calls) {
  var HackerCallEtherTransferFailed = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls,
    hacker_fallback_calls: []

  }
  return HackerCallEtherTransferFailed
}
var HackerCallEtherTransferFailedproto = HackerCallEtherTransferFailed.prototype

HackerCallEtherTransferFailedproto.TestOracle = function () {
  var hasCallEtherTransferFailed = false
  var calls = HackerCallEtherTransferFailedproto.hacker_calls[0].nextcalls
  for (var i = 0; i < calls.length; i++) {
    var call = calls[i]
    if (HackerCallEtherTransferFailedproto.TriggerFallbackCall(call) == true) {
      HackerCallEtherTransferFailedproto.hacker_fallback_calls.push(call)
      hasCallEtherTransferFailed = true
    }
  }
  return hasCallEtherTransferFailed
}
HackerCallEtherTransferFailedproto.TriggerFallbackCall = function (call) {
  return call.gasException && call.value > 0
  // return IsAccountAddress(call.callee) && call.gas.Uint64() > 2300 && call.throwException && call.value.Uint64() > 0
}

HackerCallEtherTransferFailedproto.String = function () {
  return 'HackerCallEtherTransferFailed'
}

function HackerGaslessSend (hacker_call_hashs, hacker_calls) {
  var HackerGaslessSend = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls,
    hacker_exception_calls: []

  }
  return HackerGaslessSend
}
var HackerGaslessSendproto = HackerGaslessSend.prototype

HackerGaslessSendproto.TestOracle = function () {
  var hasException = false
  var calls = HackerGaslessSendproto.hacker_calls[0].nextcalls
  for (var i = 0; i < calls.length; i++) {
    var call = calls[i]
    if (HackerGaslessSendproto.TriggerExceptionCall(call) == true) {
      HackerGaslessSendproto.hacker_exception_calls.push(call)
      hasException = true
    }
  }

  return hasException
}
HackerGaslessSendproto.TriggerExceptionCall = function (call) {
  return call.gasException == true && call.input.length == 0
}

HackerGaslessSendproto.String = function () {
  return 'HackerGaslessSend'
}

// TODO
// function HackerDelegateCallInfo (hacker_call_hashs, hacker_calls) {
//   var HackerDelegateCallInfo = {
//     hacker_call_hashs: hacker_call_hashs,
//     hacker_calls: hacker_calls,
//     hacker_exception_calls: []
//
//   }
//   return HackerDelegateCallInfo
// }
// var HackerDelegateCallInfoproto = HackerDelegateCallInfo.prototype
//
// HackerDelegateCallInfoproto.TestOracle = function () {
//   var hasException = false
//   var calls = this.hacker_calls[0].nextcalls
//   for (var i = 0; i < calls.length; i++) {
//     var call = calls[i]
//     if (this.TriggerExceptionCall(call) == true) {
//       this.hacker_exception_calls.push(call)
//       hasException = true
//     }
//   }
//
//   return hasException
// }
// HackerDelegateCallInfoproto.TriggerExceptionCall = function (call) {
//   return call.gasException == true && call.input.length == 0
// }
//
// HackerDelegateCallInfoproto.String = function () {
//   return 'HackerDelegateCallInfo'
// }

// function HackerDelegateCallInfo (hacker_call_hashs, hacker_calls) {
//   var HackerDelegateCallInfo = {
//     hacker_call_hashs: hacker_call_hashs,
//     hacker_calls: hacker_calls,
//     hacker_exception_calls: []
//
//   }
//   return HackerDelegateCallInfo
// }
// var HackerDelegateCallInfoproto = HackerDelegateCallInfo.prototype
//
// HackerDelegateCallInfoproto.TestOracle = function () {
//   var hasException = false
//   var calls = this.hacker_calls[0].nextcalls
//   for (var i = 0; i < calls.length; i++) {
//     var call = calls[i]
//     if (this.TriggerExceptionCall(call) == true) {
//       this.hacker_exception_calls.push(call)
//       hasException = true
//     }
//   }
//
//   return hasException
// }
// HackerDelegateCallInfoproto.TriggerExceptionCall = function (call) {
//   return call.gasException == true && call.input.length == 0
// }
//
// HackerDelegateCallInfoproto.String = function () {
//   return 'HackerDelegateCallInfo'
// }

function HackerExceptionDisorder (hacker_call_hashs, hacker_calls) {
  var HackerExceptionDisorder = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls,
    hacker_exception_calls: []

  }
  return HackerExceptionDisorder
}
var HackerExceptionDisorderproto = HackerExceptionDisorder.prototype
HackerExceptionDisorderproto.TestOracle = function () {
  var exception = false
  var nextcalls = HackerExceptionDisorderproto.hacker_calls[0].nextcalls
  for (var i = 0; i < nextcalls.length; i++) {
    var call = nextcalls[i]
    if (HackerExceptionDisorderproto.TriggerExceptionCall(HackerExceptionDisorderproto.hacker_calls[0], call)) {
      HackerExceptionDisorderproto.hacker_exception_calls.push(call)
      exception = true
    }
  }
  return exception
}
HackerExceptionDisorderproto.TriggerExceptionCall = function (root, call) {
  return root.throwException == false && call.throwException == true
}
HackerExceptionDisorderproto.String = function () {
  return 'HackerExceptionDisorder'
}

function HackerTimestampOp (hacker_call_hashs, hacker_calls) {
  var HackerTimestampOp = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls

  }
  return HackerTimestampOp
}
var HackerTimestampOpproto = HackerTimestampOp.prototype
HackerTimestampOpproto.TestOracle = function () {
  var rootCall = HackerTimestampOpproto.hacker_calls[0]
  if ((rootCall.OperationStack.toString()).indexOf('TIMESTAMP') >= 0) {
    return true
  } else {
    return false
  }
}

HackerTimestampOpproto.String = function () {
  return 'HackerTimestampOp'
}
module.exports = {
  HackerExceptionDisorder: HackerExceptionDisorder,
  HackerRootCallFailed: HackerRootCallFailed,
  HackerTimestampOp: HackerTimestampOp,
  HackerReentrancy: HackerReentrancy,
  HackerRepeatedCall: HackerRepeatedCall,
  HackerEtherTransfer: HackerEtherTransfer,
  HackerEtherTransferFailed: HackerEtherTransferFailed,
  HackerCallEtherTransferFailed: HackerCallEtherTransferFailed,
  HackerGaslessSend: HackerGaslessSend

}
