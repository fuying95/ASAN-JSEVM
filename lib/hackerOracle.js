
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
  var nextcalls = this.hacker_calls[0].nextcalls
  for (var i = 0; i < nextcalls.length; i++) {
    if (this.TriggerExceptionCall(hacker_calls[0], call)) {
      this.hacker_exception_calls.push(call)
      exception = true
    }
  }

  return exception
}
HackerExceptionDisorderproto.TriggerExceptionCall = function () {
  var rootCall = this.hacker_calls[0]
  return rootCall.throwException
}

function HackerRootCallFailed (hacker_call_hashs, hacker_calls) {
  var HackerExceptionDisorder = {
    hacker_call_hashs: hacker_call_hashs,
    hacker_calls: hacker_calls

  }
  return HackerExceptionDisorder
}
var HackerRootCallFailedproto = HackerRootCallFailed.prototype

HackerRootCallFailedproto.TestOracle = function () {

}

module.exports = {
  HackerExceptionDisorder: HackerExceptionDisorder,
  HackerRootCallFailed: HackerRootCallFailed

}
