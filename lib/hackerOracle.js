const HackerState = require('./hackerState')

var hackerState = new HackerState()

function HackerRootCallFailed (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls

  HackerRootCallFailed.prototype.TestOracle = function () {
    var rootCall = this.hacker_calls[0]
    return rootCall.throwException
  }
  HackerRootCallFailed.prototype.String = function () {
    return 'HackerRootCallFailed fun: ' + this.hacker_calls[0].input.slice(0, 8)
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
      if (hash1.toString('hex') === hash2.toString('hex')) {
        if (this.hacker_calls[i].OperationStack.length <= this.hacker_calls[j].OperationStack.length) {
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
    return 'HackerReentrancy fun: ' + this.feauture
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
        if (hash1.toString('hex') === hash2.toString('hex') && (this.hacker_calls[i].isBrother(i, this.hacker_calls[j]))) {
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
  this.feature = []
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
        this.feature.push(call.input.slice(0, 8))
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
    return 'HackerEtherTransfer fun: ' + this.feature.toString()
  }

  // return HackerEtherTransfer
}

function HackerEtherTransferFailed (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  this.feature = []

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
        this.feature.push(call.input.slice(0, 8))
        ret = true
      }
    }

    return ret
  }
  HackerEtherTransferFailed.prototype.triggerOracle = function (call) {
    return (call.value > 0 || call.OperationStack.toString().indexOf('BALANCE')) && call.throwException
  }

  HackerEtherTransferFailed.prototype.String = function () {
    return 'HackerEtherTransferFailed fun: ' + this.feature.toString()
  }

  // return HackerEtherTransferFailed
}

function HackerCallEtherTransferFailed (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_fallback_calls = []
  this.feature = []
  // var HackerCallEtherTransferFailedproto = HackerCallEtherTransferFailed.prototype

  HackerCallEtherTransferFailed.prototype.TestOracle = function () {
    var hasCallEtherTransferFailed = false
    var calls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i]
      if (this.TriggerFallbackCall(call) == true) {
        this.hacker_fallback_calls.push(call)
        this.feature.push(call.input.slice(0, 8))
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
    return 'HackerCallEtherTransferFailed fun: ' + this.feature.toString()
  }

  // return HackerCallEtherTransferFailed
}

function HackerGaslessSend (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs                                          //call rules
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  this.feature = []

  HackerGaslessSend.prototype.TestOracle = function () {                              // judge if the trade call suit the detection rule
    var hasException = false                                                          //if it has no exception, analyze the information in hack_call that trade called in next trade
    var calls = this.hacker_calls[0].nextcalls                                        //analyze every trade
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i]
      if (this.TriggerExceptionCall(call) == true) {                                  //if TriggerExceptionCall had be called, call hacker_exception_calls
        this.hacker_exception_calls.push(call)
        this.feature.push(call.input.slice(0, 8))                                     //return the function signature
        hasException = true
      }
    }

    return hasException                                                               //return exception existed	
  }
  HackerGaslessSend.prototype.TriggerExceptionCall = function (call) {
    return call.gasException == true && call.input == '' && call.gas == 2300          //when the gasException had be called, information had be input in the function, and 2300 gas had be used, the exception is existed
  }

  HackerGaslessSend.prototype.String = function () {
    return 'HackerGaslessSend fun: ' + this.feature.toString()                        //return the function signature of exception function
  }

  // return HackerGaslessSend
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
    return 'HackerTimestampOp fun: ' + this.hacker_calls[0].input.slice(0, 8)
  }

  // return HackerTimestampOp
}

function HackerCallOpInfo (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  this.feature = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerCallOpInfo.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        this.feature.push(call.input.slice(0, 8))
        ret = true
      }
    }

    return ret
  }

  HackerCallOpInfo.prototype.triggerOracle = function (call) {
    return call.gas > 2300
  }
  HackerCallOpInfo.prototype.String = function () {
    return 'HackerCallOpInfo fun: ' + this.feature.toString()
  }
}

function HackerSendOpInfo (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  this.feature = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerSendOpInfo.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        this.feature.push(call.input.slice(0, 8))
        ret = true
      }
    }

    return ret
  }

  HackerSendOpInfo.prototype.triggerOracle = function (call) {
    return (call.gas == 2300 && call.input != null)
  }
  HackerSendOpInfo.prototype.String = function () {
    return 'HackerSendOpInfo fun: ' + this.feature.toString()
  }
}

function HackerCallExecption (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  this.feature = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerCallExecption.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(call)) {
        this.hacker_exception_calls.push(call)
        this.feature.push(call.input.slice(0, 8))
        ret = true
      }
    }

    return ret
  }

  HackerCallExecption.prototype.triggerOracle = function (call) {
    return (call.gas > 2300 && call.throwException == true)
  }
  HackerCallExecption.prototype.String = function () {
    return 'NewHackerCallExecption fun: ' + this.feature.toString()
  }
}

function HackerStorageChanged (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []

  HackerStorageChanged.prototype.TestOracle = function () {
    var ret = false
    if (this.triggerOracle(this.hacker_calls[0])) {
      this.hacker_exception_calls.push(this.hacker_calls[0])
      ret = true
    }
    return ret
  }

  HackerStorageChanged.prototype.triggerOracle = function (rootCall) {
    var rootStorage = rootCall.StateStack
    var ret = hackerState.CmpHackerState(rootStorage[0], rootStorage[rootStorage.length - 1])
    return !ret
  }
  HackerStorageChanged.prototype.String = function () {
    return 'HackerStorageChanged fun:' + this.hacker_calls[0].input.slice(0, 8)
  }
}

function HackerUnknowCall (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs
  this.hacker_calls = hacker_calls
  this.hacker_exception_calls = []
  this.feature = []
  // var HackerTimestampOpproto = HackerTimestampOp.prototype
  HackerUnknowCall.prototype.TestOracle = function () {
    var ret = false
    var nextcalls = this.hacker_calls[0].nextcalls
    for (var i = 0; i < nextcalls.length; i++) {
      var call = nextcalls[i]
      if (this.triggerOracle(this.hacker_calls[0], call)) {
        this.hacker_exception_calls.push(call)
        this.feature.push(call.input)
        ret = true
      }
    }

    return ret
  }

  HackerUnknowCall.prototype.triggerOracle = function (rootCall, call) {
    var input_str = rootCall.input
    var callee_str = call.callee.toString()
    if ((call.gas > 2300)) {
      return ((rootCall.caller.toString() == call.callee.toString()) || (input_str.indexOf(call.input.slice(0, 8) >= 0)) || (input_str.indexOf(callee_str) >= 0))
    }
    return false
    // return ((rootCall.caller.toString() == call.callee.toString()) || (input_str.indexOf(call.input >= 0)) || (input_str.indexOf(callee_str) >= 0))
  }
  HackerUnknowCall.prototype.String = function () {
    return 'HackerUnknowCall fun: ' + this.feature.toString()
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
    return 'HackerNumberOp fun: ' + this.hacker_calls[0].input.slice(0, 8)
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
    return 'HackerBlockHashOp fun: ' + this.hacker_calls[0].input.slice(0, 8)
  }

  // return HackerTimestampOp
}

// Add Dangerous DelegateCall Detector
function HackerDelegateCallInfo (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs                                 //call the rules
  this.hacker_calls = hacker_calls
  this.hacker_delegate_calls = []
  this.feautures = []
  HackerDelegateCallInfo.prototype.TestOracle = function () {                //judge if the trade call suit the detection rule  
    var hasDelegate = false                                                  // hypothesize it have no delegate call
    var nextcalls = this.hacker_calls[0].nextcalls                           //”hacker_call” save all the information that be called in one trade
    for (var i = 0; i < nextcalls.length; i++) {                             //analysis the first information that be called in every trade
      var call = nextcalls[i]
      if (this.TriggerDelegateCall(call)) {                                  //judge if the trade call include the delegate call
        this.hacker_delegate_calls.push(call)                                //if there is a delegate call，call “this.hacker_delegate_calls” 
        hasDelegate = true
        this.GetFeatures(this.hacker_calls[0], call)                         //if “this.TriggerDelegateCall(call)” is true，call 
      }
    }
    return hasDelegate
  }
  HackerDelegateCallInfo.prototype.GetFeatures = function (rootcall, call) {
    if ((rootcall.caller.toString('hex') == call.callee.toString('hex')) || rootcall.input.indexOf(call.callee.toString('hex').slice(2)) >= 0) {  
                                                                             //judge if the caller and the target object to be called are the same  
      this.feautures.push('DANGEROUS_CALLER')                                //add the “DANGEROUS_CALLER” tag if the judgement is true 
    }
    if (rootcall.input.indexOf(call.input >= 0)) {                           //judge if the caller had anything input
      this.feautures.push('DANGEROUS_INPUT')                                 //add “DANGEROUS_INPUT” tag if the judgement is true 
    }
  }
  HackerDelegateCallInfo.prototype.TriggerDelegateCall = function (call) {
    if (call.OperationStack.toString().indexOf('DELEGATECALL') >= 0) {       //analyse if the stack of operation code include any “DELEGATECALL”      
      return true
    } else {
      return false
    }
  }
  HackerDelegateCallInfo.prototype.String = function () {
    if (this.feautures.length > 0) {                                         //analyse if any information in “feautures”
      var info = 'HackerDelegateCallInfo:'
      for (var i = 0; i < this.feautures.length; i++) {
        info += this.feautures[i] + ' '                                      //add “HackerDelegateCallInfo” in “feautures”
      }
      return info.toString()                                                 //return the information in “feautures”
    } else {
      return 'delegatecallop'                                                //return “delegatecallop” in the end of loop
    }
  }
}

// Add Exception Disorder Detector
function HackerExceptionDisorder (hacker_call_hashs, hacker_calls) {
  this.hacker_call_hashs = hacker_call_hashs 
  this.hacker_calls = hacker_calls                                                     //call rules
  this.hacker_exception_calls = []
  this.feature = []	

  HackerExceptionDisorder.prototype.TestOracle = function () {                         // judge if the trade call suit the detection rule  
    var exception = false                                                              // hypothesize it have no exception	
    var nextcalls = this.hacker_calls[0].nextcalls                                     //analyse the first information in hacker_call that be called in each trade
    for (var i = 0; i < nextcalls.length; i++) {                                       //analyse every trade
      var call = nextcalls[i]
      if (this.TriggerExceptionCall(this.hacker_calls[0], call)) {                     //judge if the ExceptionDisorder (detection rule) in hacker_calls had be called
        this.hacker_exception_calls.push(call)                                         // if the ExceptionCall had be called, call hacker_exception_calls
        this.feature.push(call.input.slice(0, 8))                                      // return the function signature
        exception = true                                                               // exception existed
      }
    }
    return exception
  }
  HackerExceptionDisorder.prototype.TriggerExceptionCall = function (root, call) {     // add TriggerExceptionCall under HackerExceptionDisorder
    return root.throwException == false && call.throwException == true                 //when the root call didn’t return exception and subroutine call had return exception, the exception is existed
  }
  HackerExceptionDisorder.prototype.String = function () {                      
return 'HackerExceptionDisorder fun: ' + this.feature.toString()                       //return the function signature of exception function
  }
}


module.exports = {
  HackerRootCallFailed: HackerRootCallFailed,
  HackerTimestampOp: HackerTimestampOp,
  HackerReentrancy: HackerReentrancy,
  HackerRepeatedCall: HackerRepeatedCall,
  HackerEtherTransfer: HackerEtherTransfer,
  HackerEtherTransferFailed: HackerEtherTransferFailed,
  HackerCallEtherTransferFailed: HackerCallEtherTransferFailed,
  HackerGaslessSend: HackerGaslessSend,
  HackerCallOpInfo: HackerCallOpInfo,
  HackerSendOpInfo: HackerSendOpInfo,
  HackerCallExecption: HackerCallExecption,
  HackerStorageChanged:HackerStorageChanged,
  HackerUnknowCall: HackerUnknowCall,
  HackerNumberOp: HackerNumberOp,
  HackerBlockHashOp: HackerBlockHashOp,
  HackerDelegateCallInfo: HackerDelegateCallInfo,
  // HackerBalanceGtZero:HackerBalanceGtZero

}
