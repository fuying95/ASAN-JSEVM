const { promisify } = require('util')
const tape = require('tape')
const Block = require('ethereumjs-block')
const Transaction = require('ethereumjs-tx')
const Common = require('ethereumjs-common')
const util = require('ethereumjs-util')
const runBlock = require('../../lib/runBlock')
const StateManager = require('../../lib/stateManager')
const runTx = require('../../lib/runTx')
const testData = require('./testdata.json')
const { createGenesis, createAccount, setupVM } = require('./utils')
const { setupPreConditions } = require('../util')

function setup (vm = null) {
  // Create a mock, if no real VM object provided.
  // The mock includes mocked runTx and runCall which
  // always return an error.
  if (vm === null) {
    const stateManager = new StateManager()
    vm = {
      stateManager,
      emit: (e, val, cb) => cb(),
      populateCache: stateManager.warmCache.bind(stateManager),
      runTx: (opts, cb) => cb(new Error('test')),
      runCall: (opts, cb) => cb(new Error('test')),
      _common: new Common('mainnet', 'byzantium')
    }
  }

  return {
    vm,
    data: testData,
    p: {
      runBlock: promisify(runBlock.bind(vm)),
      putAccount: promisify(vm.stateManager.putAccount.bind(vm.stateManager)),
      cacheFlush: promisify(vm.stateManager.cache.flush.bind(vm.stateManager.cache))
    }
  }
}

tape('runBlock', async (t) => {
  const suite = setup()

  t.test('should fail without params', async (st) => {
    suite.p.runBlock()
      .then(() => st.fail('should have returned error'))
      .catch((e) => st.ok(e.message.includes('invalid input'), 'correct error'))

    st.end()
  })

  t.test('should fail without opts', async (st) => {
    suite.p.runBlock({})
      .then(() => st.fail('should have returned error'))
      .catch((e) => st.ok(e.message.includes('invalid input'), 'correct error'))

    st.end()
  })

  t.test('should fail when runTx fails', async (st) => {
    const genesis = createGenesis()
    const block = new Block(util.rlp.decode(suite.data.blocks[0].rlp))

    // The mocked VM uses a mocked runTx
    // which always returns an error.
    await suite.p.runBlock({ block, root: genesis.header.stateRoot })
      .then(() => t.fail('should have returned error'))
      .catch((e) => t.equal(e.message, 'test'))

    st.end()
  })
})

tape('should fail when tx gas limit higher than block gas limit', async (t) => {
  const suite = setup()

  const genesis = createGenesis()
  const block = new Block(util.rlp.decode(suite.data.blocks[0].rlp))
  block.transactions[0].gasLimit = Buffer.from('3fefba', 'hex')
  suite.p.runBlock({ block, root: genesis.header.stateRoot })
    .then(() => t.fail('should have returned error'))
    .catch((e) => t.ok(e.message.includes('higher gas limit')))

  t.end()
})

tape('should fail when runCall fails', async (t) => {
  const suite = setup()

  const block = new Block(util.rlp.decode(suite.data.blocks[0].rlp))
  // Add some balance to accounts, so they can run txes
  for (let i = 0; i < block.transactions.length; i++) {
    let tx = new Transaction(block.transactions[i])
    const acc = createAccount()
    await suite.p.putAccount(tx.from.toString('hex'), acc)
  }
  await suite.p.cacheFlush()

  // The mocked VM uses a mocked runCall
  // which always returns an error.
  // runTx is a full implementation that works.
  suite.vm.runTx = runTx
  await suite.p.runBlock({ block, root: suite.vm.stateManager.trie.root })
    .then(() => t.fail('should have returned error'))
    .catch((e) => t.equal(e.message, 'test'))

  t.end()
})

tape('should run valid block', async (t) => {
  const vm = setupVM()
  const suite = setup(vm)

  const genesis = new Block(util.rlp.decode(suite.data.genesisRLP))
  const block = new Block(util.rlp.decode(suite.data.blocks[0].rlp))

  const setupPreP = promisify(setupPreConditions)
  await setupPreP(suite.vm.stateManager.trie, suite.data)

  t.equal(
    suite.vm.stateManager.trie.root.toString('hex'),
    genesis.header.stateRoot.toString('hex'),
    'genesis state root should match calculated state root'
  )

  let res = await suite.p.runBlock({ block, root: suite.vm.stateManager.trie.root })
  t.error(res.error, 'runBlock shouldn\'t have returned error')
  t.equal(res.results[0].gasUsed.toString('hex'), '5208', 'actual gas used should equal blockHeader gasUsed')

  t.end()
})
