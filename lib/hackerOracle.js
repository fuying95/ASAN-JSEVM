
function HackerRootCallFailed (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls

  HackerRootCallFailed.prototype.TestOracle = function () {
    var rootCall = this.hacker_calls[0]
    return rootCall.throwException
  }
  HackerRootCallFailed.prototype.String = function () {
    return 'HackerRootCallFailed'
  }
}

function HackerReentrancy (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.repeatedPairs = [][2]
  this.feauture = ''

  HackerReentrancy.prototype.TestOracle = function () {
    var hasReen = false
    var i = 0
    var j
    var hash1 = this.hacker_call_hashs[i]
    for (j = i + 1; j < this.hacker_call_hashs.length; j++) {
      var hash2 = this.hacker_call_hashs[j]
      // compare two call hash equal?
      // compare two call operationLen equal? detect anti-reentrancy protection
      // if strings.Compare(hash1.String(),hash2.String()) == 0&&oracle.hacker_calls[i].OperationStack.len()<=oracle.hacker_calls[j].OperationStack.len()&&
      // (oracle.hacker_calls[i].isAncestor(oracle.hacker_calls[j]) || oracle.hacker_calls[j].isAncestor(oracle.hacker_calls[i])){
      if (hash1.toString() === hash2.toString()) {
        if (this.hacker_calls[i].OperationStack.len() <= this.hacker_calls[j].OperationStack.len()) {
          this.feauture = 'le'
        } else {
          this.feauture = 'anti-reentrancy'
        }
        var repeatedPair = [this.hacker_calls[i], this.hacker_calls[j]]
        this.repeatedPairs.push(repeatedPair)
        hasReen = true
      }
    }
    return hasReen
  }
  HackerReentrancy.prototype.String = function () {
    return 'HackerReentrancy' + this.feauture
  }
}

function HackerRepeatedCall (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.repeatedPairs = [][2]
  HackerRepeatedCall.prototype.TestOracle = function () {
    var hasRepeated = false
    // nextcalls_len := len(oracle.hacker_calls[0].nextcalls)
    for (var i = 0; i < this.hacker_call_hashs.length; i++) {
      var hash1 = this.hacker_call_hashs[i]
      for (var j = i + 1; j < this.hacker_call_hashs.length; j++) {
        var hash2 = this.hacker_call_hashs[j]
        if (hash1.toString() === hash2.toString() && (this.hacker_calls[i].isBrother(i, this.hacker_calls[j]))) {
          var repeatedPair = [this.hacker_calls[i], this.hacker_calls[j]]
          this.repeatedPairs.push(repeatedPair)
          hasRepeated = true
        }
      }
    }
    return hasRepeated
  }
  HackerRepeatedCall.prototype.String = function () {
    return 'HackerRepeatedCall'
  }

  // return HackerRepeatedCall
}

function HackerEtherTransfer (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  // var HackerEtherTransferproto = HackerEtherTransfer.prototype

  HackerEtherTransfer.prototype.TestOracle = function () {
    var ret = false
    // if oracle.triggerOracle(oracle.hacker_calls[0]){
    // 	oracle.hacker_exception_calls = append(oracle.hacker_exception_calls, oracle.hacker_calls[0])
    // 	ret = true
    // }
    var calls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        ret = true
      }
    }
    return ret
  }
  HackerEtherTransfer.prototype.triggerOracle = function (call) {
    var nextcalls = call.nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var n_call = nextcalls[i]
      if (n_call.value > 0) {
        return true
      }
    }

    return call.value > 0
  }

  HackerEtherTransfer.prototype.String = function () {
    return 'HackerEtherTransfer'
  }

  // return HackerEtherTransfer
}

function HackerEtherTransferFailed (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []

  // var this = HackerEtherTransferFailed.prototype

  HackerEtherTransferFailed.prototype.TestOracle = function () {
    var ret = false
    if (this.triggerOracle(this.hacker_calls[0])) {
      this.hacker_exception_calls.push(this.hacker_calls[0])
    }
    var calls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        ret = true
      }
    }

    return ret
  }
  HackerEtherTransferFailed.prototype.triggerOracle = function (call) {
    return (call.value > 0 || call.OperationStack.toString().indexOf('BALANCE')) && call.throwException
  }

  HackerEtherTransferFailed.prototype.String = function () {
    return 'HackerEtherTransferFailed'
  }

  // return HackerEtherTransferFailed
}

function HackerCallEtherTransferFailed (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_fallback_calls = []
  // var HackerCallEtherTransferFailedproto = HackerCallEtherTransferFailed.prototype

  HackerCallEtherTransferFailed.prototype.TestOracle = function () {
    var hasCallEtherTransferFailed = false
    var calls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i]
      if (this.TriggerFallbackCall(call) == true) {
        this.hacker_fallback_calls.push(call)
        hasCallEtherTransferFailed = true
      }
    }
    return hasCallEtherTransferFailed
  }
  HackerCallEtherTransferFailed.prototype.TriggerFallbackCall = function (call) {
    return call.gasException && call.value > 0
    // return IsAccountAddress(call.callee) && call.gas.Uint64() > 2300 && call.throwException && call.value.Uint64() > 0
  }

  HackerCallEtherTransferFailed.prototype.String = function () {
    return 'HackerCallEtherTransferFailed'
  }

  // return HackerCallEtherTransferFailed
}

function HackerGaslessSend (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  var HackerGaslessSendproto = HackerGaslessSend.prototype

  HackerGaslessSend.prototype.TestOracle = function () {
    var hasException = false
    var calls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i]
      if (this.TriggerExceptionCall(call) == true) {
        this.hacker_exception_calls.push(call)
        hasException = true
      }
    }

    return hasException
  }
  HackerGaslessSend.prototype.TriggerExceptionCall = function (call) {
    return call.gasException == true && call.input.length == 0
  }

  HackerGaslessSend.prototype.String = function () {
    return 'HackerGaslessSend'
  }

  // return HackerGaslessSend
}

function HackerExceptionDisorder (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  // var HackerExceptionDisorderproto = HackerExceptionDisorder.prototype
  HackerExceptionDisorder.prototype.TestOracle = function () {
    var exception = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.TriggerExceptionCall(this.hacker_calls[0], call)) {
        this.hacker_exception_calls.push(call)
        exception = true
      }
    }
    return exception
  }
  HackerExceptionDisorder.prototype.TriggerExceptionCall = function (root, call) {
    return root.throwException == false && call.throwException == true
  }
  HackerExceptionDisorder.prototype.String = function () {
    return 'HackerExceptionDisorder'
  }

  // return HackerExceptionDisorder
}

function HackerTimestampOp (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerTimestampOp.prototype.TestOracle = function () {
    var rootCall = this.hacker_calls[0]
    if ((rootCall.OperationStack.toString()).indexOf('TIMESTAMP') >= 0) {
      return true
    } else {
      return false
    }
  }

  HackerTimestampOp.prototype.String = function () {
    return 'HackerTimestampOp'
  }

  // return HackerTimestampOp
}

function HackerDelegateCallInfo (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_delegate_calls = []
  this.feautures = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerDelegateCallInfo.prototype.TestOracle = function () {
    var hasDelegate = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.TriggerDelegateCall(call)) {
        this.hacker_delegate_calls.push(call)
        hasDelegate = true
        this.GetFeatures(this.hacker_calls[0], call)
      }
    }
    return hasDelegate
  }
  HackerDelegateCallInfo.prototype.GetFeatures = function (rootcall, call) {
    if ((rootcall.caller.toString('hex') == rootcall.callee.toString('hex')) || rootcall.input.toString().indexOf(rootcall.callee.toString('hex').slice(2)) >= 0) {
      this.feautures.push('DANGEROUS_CALLER')
    }
    if (rootcall.input.toString().indexOf(call.input.toString() >= 0)) {
      this.feautures.push('DANGEROUS_INPUT')
    }
  }
  HackerDelegateCallInfo.prototype.TriggerDelegateCall = function (call) {
    if (call.OperationStack.toString().indexOf('DELEGATECALL')) {
      return true
    } else {
      return false
    }
  }
  HackerDelegateCallInfo.prototype.String = function () {
    if (this.feautures.length > 0) {
      var info = 'HackerDelegateCallInfo:'
      for (var i = 0; i < this.feautures.length; i++) {
        info += this.feautures[i] + ' '
      }
      return info.toString()
    } else {
      return 'delegatecallop'
    }
  }

}

function HackerCallOpInfo (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerCallOpInfo.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        ret = true
      }
    }

    return ret
  }

  HackerCallOpInfo.prototype.triggerOracle = function (call) {
    return call.gasPrice > 2300
  }
  HackerCallOpInfo.prototype.String = function () {
    return 'HackerCallOpInfo'
  }
}

function HackerSendOpInfo (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerSendOpInfo.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        ret = true
      }
    }

    return ret
  }

  HackerSendOpInfo.prototype.triggerOracle = function (call) {
    return (call.gasPrice == 2300 && call.input != null)
  }
  HackerSendOpInfo.prototype.String = function () {
    return 'HackerSendOpInfo'
  }
}

function HackerCallExecption (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerCallExecption.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        ret = true
      }
    }

    return ret
  }

  HackerCallExecption.prototype.triggerOracle = function (call) {
    return (call.gasPrice > 2300 && call.throwException == true)
  }
  HackerCallExecption.prototype.String = function () {
    return 'NewHackerCallExecption'
  }
}

// function HackerStorageChanged (hacker_call_hashs, hacker_calls) {
//   this.hacker_call_hashs = hacker_call_hashs
//   this.hacker_calls = hacker_calls
//   this.hacker_exception_calls = []
//   // var HackerTimestampOpproto = HackerTimestampOp.prototype
//   HackerStorageChanged.prototype.TestOracle = function () {
//     var ret = false
//     var nextcalls = this.hacker_calls[0].nextcalls
//     for (var i = 0; i < nextcalls.length; i++) {
//       var call = nextcalls[i]
//       if (this.triggerOracle(call)) {
//         this.hacker_exception_calls.push(call)
//         ret = true
//       }
//     }
//
//     return ret
//   }
//
//   HackerStorageChanged.prototype.triggerOracle = function (rootCall) {
//     var rootStorage = rootCall.StateStack
//     ret,_ := rootStorage.Data()[0].Cmp(rootStorage.Data()[rootStorage.len()-1])
//     return ret!=0
//   }
//   HackerStorageChanged.prototype.String = function () {
//     return 'HackerStorageChanged'
//   }
// }

function HackerUnknowCall (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerUnknowCall.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(this.hacker_calls[0], call)) {
        this.hacker_exception_calls.push(call)
        ret = true
      }
    }

    return ret
  }

  HackerUnknowCall.prototype.triggerOracle = function (rootCall, call) {
    var input_str = rootCall.input.toString()
    var callee_str = call.callee.toString()
    if ((call.gasPrice > 2300)) {
      return ((rootCall.caller.toString() == call.callee.toString()) || (input_str.indexOf(call.input.toString() >= 0)) || (input_str.indexOf(callee_str) >= 0))
    }
    return false
    // return ((rootCall.caller.toString() == call.callee.toString()) || (input_str.indexOf(call.input.toString() >= 0)) || (input_str.indexOf(callee_str) >= 0))
  }
  HackerUnknowCall.prototype.String = function () {
    return 'HackerUnknowCall'
  }
}

function HackerNumberOp (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls

  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerNumberOp.prototype.TestOracle = function () {
    var rootCall = this.hacker_calls[0]
    if ((rootCall.OperationStack.toString()).indexOf('NUMBER') >= 0) {
      return true
    } else {
      return false
    }
  }

  HackerNumberOp.prototype.String = function () {
    return 'HackerNumberOp'
  }

  // return HackerTimestampOp
}

function HackerBlockHashOp (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls

  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerBlockHashOp.prototype.TestOracle = function () {
    var rootCall = this.hacker_calls[0]
    if ((rootCall.OperationStack.toString()).indexOf('BLOCKHASH') >= 0) {
      return true
    } else {
      return false
    }
  }

  HackerBlockHashOp.prototype.String = function () {
    return 'HackerBlockHashOp'
  }

  // return HackerTimestampOp
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
  HackerGaslessSend: HackerGaslessSend,
  HackerDelegateCallInfo: HackerDelegateCallInfo,
  HackerCallOpInfo: HackerCallOpInfo,
  HackerSendOpInfo: HackerSendOpInfo,
  HackerCallExecption: HackerCallExecption,
  // HackerStorageChanged:HackerStorageChanged
  HackerUnknowCall: HackerUnknowCall,
  HackerNumberOp: HackerNumberOp,
  HackerBlockHashOp: HackerBlockHashOp
  // HackerBalanceGtZero:HackerBalanceGtZero

}
