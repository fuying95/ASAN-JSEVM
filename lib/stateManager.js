const Buffer = require('safe-buffer').Buffer
const Trie = require('merkle-patricia-tree/secure.js')
const Common = require('ethereumjs-common')
const genesisStates = require('ethereumjs-common/genesisStates')
const async = require('async')
const Account = require('ethereumjs-account')
const Cache = require('./cache.js')
const utils = require('ethereumjs-util')
const BN = utils.BN
const rlp = utils.rlp

module.exports = StateManager

function StateManager (opts = {}) {
  var self = this

  self.trie = opts.trie || new Trie()

  var common = opts.common
  if (!common) {
    common = new Common('mainnet', 'byzantium')
  }
  self._common = common

  self._storageTries = {} // the storage trie cache
  self.cache = new Cache(self.trie)
  self._touched = new Set()
  self._touchedStack = []
}

var proto = StateManager.prototype

proto.copy = function () {
  return new StateManager({ trie: this.trie.copy() })
}

// gets the account from the cache, or triggers a lookup and stores
// the result in the cache
proto.getAccount = function (address, cb) {
  this.cache.getOrLoad(address, cb)
}

// saves the account
proto.putAccount = function (address, account, cb) {
  var self = this
  // TODO: dont save newly created accounts that have no balance
  // if (toAccount.balance.toString('hex') === '00') {
  // if they have money or a non-zero nonce or code, then write to tree
  self.cache.put(address, account)
  self._touched.add(address.toString('hex'))
  // self.trie.put(addressHex, account.serialize(), cb)
  cb()
}

proto.getAccountBalance = function (address, cb) {
  var self = this
  self.getAccount(address, function (err, account) {
    if (err) {
      return cb(err)
    }
    cb(null, account.balance)
  })
}

proto.putAccountBalance = function (address, balance, cb) {
  var self = this

  self.getAccount(address, function (err, account) {
    if (err) {
      return cb(err)
    }

    account.balance = balance
    self.putAccount(address, account, cb)
  })
}

// sets the contract code on the account
proto.putContractCode = function (address, value, cb) {
  var self = this
  self.getAccount(address, function (err, account) {
    if (err) {
      return cb(err)
    }
    // TODO: setCode use trie.setRaw which creates a storage leak
    account.setCode(self.trie, value, function (err) {
      if (err) {
        return cb(err)
      }
      self.putAccount(address, account, cb)
    })
  })
}

// given an account object, returns the code
proto.getContractCode = function (address, cb) {
  var self = this
  self.getAccount(address, function (err, account) {
    if (err) {
      return cb(err)
    }
    account.getCode(self.trie, cb)
  })
}

// creates a storage trie from the primary storage trie
proto._lookupStorageTrie = function (address, cb) {
  var self = this
  // from state trie
  self.getAccount(address, function (err, account) {
    if (err) {
      return cb(err)
    }
    var storageTrie = self.trie.copy()
    storageTrie.root = account.stateRoot
    storageTrie._checkpoints = []
    cb(null, storageTrie)
  })
}

// gets the storage trie from the storage cache or does lookup
proto._getStorageTrie = function (address, cb) {
  var self = this
  var storageTrie = self._storageTries[address.toString('hex')]
  // from storage cache
  if (storageTrie) {
    return cb(null, storageTrie)
  }
  // lookup from state
  self._lookupStorageTrie(address, cb)
}

proto.getContractStorage = function (address, key, cb) {
  var self = this
  self._getStorageTrie(address, function (err, trie) {
    if (err) {
      return cb(err)
    }
    trie.get(key, function (err, value) {
      if (err) {
        return cb(err)
      }
      var decoded = rlp.decode(value)
      cb(null, decoded)
    })
  })
}

proto._modifyContractStorage = function (address, modifyTrie, cb) {
  var self = this
  self._getStorageTrie(address, function (err, storageTrie) {
    if (err) {
      return cb(err)
    }

    modifyTrie(storageTrie, finalize)

    function finalize (err) {
      if (err) return cb(err)
      // update storage cache
      self._storageTries[address.toString('hex')] = storageTrie
      // update contract stateRoot
      var contract = self.cache.get(address)
      contract.stateRoot = storageTrie.root
      self.putAccount(address, contract, cb)
      self._touched.add(address.toString('hex'))
    }
  })
}

proto.putContractStorage = function (address, key, value, cb) {
  var self = this
  self._modifyContractStorage(address, function (storageTrie, done) {
    if (value && value.length) {
      // format input
      var encodedValue = rlp.encode(value)
      storageTrie.put(key, encodedValue, done)
    } else {
      // deleting a value
      storageTrie.del(key, done)
    }
  }, cb)
}

proto.clearContractStorage = function (address, cb) {
  var self = this
  self._modifyContractStorage(address, function (storageTrie, done) {
    storageTrie.root = storageTrie.EMPTY_TRIE_ROOT
    done()
  }, cb)
}

//
// revision history
//
proto.checkpoint = function () {
  var self = this
  self.trie.checkpoint()
  self.cache.checkpoint()
  self._touchedStack.push(new Set([...self._touched]))
}

proto.commit = function (cb) {
  var self = this
  // setup trie checkpointing
  self.trie.commit(function () {
    // setup cache checkpointing
    self.cache.commit()
    self._touchedStack.pop()
    cb()
  })
}

proto.revert = function (cb) {
  var self = this
  // setup trie checkpointing
  self.trie.revert()
  // setup cache checkpointing
  self.cache.revert()
  self._storageTries = {}
  self._touched = self._touchedStack.pop()
  cb()
}

//
// cache stuff
//
proto.getStateRoot = function (cb) {
  var self = this
  self.cache.flush(function (err) {
    if (err) {
      return cb(err)
    }
    var stateRoot = self.trie.root
    cb(null, stateRoot)
  })
}

/**
 * @param {Set} addresses a set of addresses
 * @param {Function} cb the callback function
 */
proto.warmCache = function (addresses, cb) {
  this.cache.warm(addresses, cb)
}

proto.dumpStorage = function (address, cb) {
  var self = this
  self._getStorageTrie(address, function (err, trie) {
    if (err) {
      return cb(err)
    }
    var storage = {}
    var stream = trie.createReadStream()
    stream.on('data', function (val) {
      storage[val.key.toString('hex')] = val.value.toString('hex')
    })
    stream.on('end', function () {
      cb(storage)
    })
  })
}

proto.hasGenesisState = function (cb) {
  const root = this._common.genesis().stateRoot
  this.trie.checkRoot(root, cb)
}

proto.generateCanonicalGenesis = function (cb) {
  var self = this

  this.hasGenesisState(function (err, genesis) {
    if (!genesis && !err) {
      self.generateGenesis(genesisStates[self._common.chainName()], cb)
    } else {
      cb(err)
    }
  })
}

proto.generateGenesis = function (initState, cb) {
  var self = this
  var addresses = Object.keys(initState)
  async.eachSeries(addresses, function (address, done) {
    var account = new Account()
    account.balance = new BN(initState[address]).toArrayLike(Buffer)
    address = Buffer.from(address, 'hex')
    self.trie.put(address, account.serialize(), done)
  }, cb)
}

proto.accountIsEmpty = function (address, cb) {
  var self = this
  self.getAccount(address, function (err, account) {
    if (err) {
      return cb(err)
    }

    cb(null, account.nonce.toString('hex') === '' && account.balance.toString('hex') === '' && account.codeHash.toString('hex') === utils.KECCAK256_NULL_S)
  })
}

proto.cleanupTouchedAccounts = function (cb) {
  var self = this
  var touchedArray = Array.from(self._touched)
  async.forEach(touchedArray, function (addressHex, next) {
    var address = Buffer.from(addressHex, 'hex')
    self.accountIsEmpty(address, function (err, empty) {
      if (err) {
        next(err)
        return
      }

      if (empty) {
        self.cache.del(address)
      }
      next(null)
    })
  },
  function () {
    self._touched.clear()
    cb()
  })
}
