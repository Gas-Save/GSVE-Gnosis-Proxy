var abi = require('ethereumjs-abi')

const safeDetails = require('@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol')

const factoryDetails = require('@gnosis.pm/safe-contracts/contracts/GnosisSafeProxyFactory.sol')


const proxyDetails = require('@gnosis.pm/safe-contracts/build/contracts/IProxy.json')
const Proxy = new web3.eth.Contract(proxyDetails.abi)

const SecureFactory = artifacts.require('Safe_1_1_1_Factory')

contract('Safe 1.1.1 Factory', function(accounts) {
    let gnosisSafe
    let proxyFactory
    let safeFactory

    before(async function() {
        // Create Master Copies
        gnosisSafe = await safeDetails.at("0x34cfac646f301356faa8b21e94227e3583fe3f5f")
        //proxyFactory = await ProxyFactory.deploy().send({ "from": accounts[0]})
        //safeFactory = await SecureFactory.new()
    })
/*
    it('deploy', async () => {
        const tx = await web3.eth.sendTransaction({from: accounts[9], to: safeFactory.address, value: 0})
        const safe = GnosisSafe.clone()
        safe.options.address = "0x" + tx.logs[0].data.slice(26)
        const mastercopy = await web3.eth.getStorageAt(safe.options.address, 0)
        assert.equal(mastercopy, gnosisSafe.options.address.toLowerCase())
        const fallbackHandler = await web3.eth.getStorageAt(safe.options.address, "0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5")
        assert.equal(fallbackHandler, "0x0")
        assert.equal(await safe.methods.getThreshold().call(), 1)
        assert.deepEqual(await safe.methods.getOwners().call(), [ accounts[9] ])
        assert.deepEqual(await safe.methods.getModules().call(), [])
    })

    it('deploy with funding', async () => {
        const tx = await web3.eth.sendTransaction({from: accounts[8], to: safeFactory.address, value: web3.utils.toWei("0.7331")})
        const safe = GnosisSafe.clone()
        safe.options.address = "0x" + tx.logs[0].data.slice(26)
        const mastercopy = await web3.eth.getStorageAt(safe.options.address, 0)
        assert.equal(mastercopy, gnosisSafe.options.address.toLowerCase())
        const fallbackHandler = await web3.eth.getStorageAt(safe.options.address, "0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5")
        assert.equal(fallbackHandler, "0x0")
        assert.equal(await safe.methods.getThreshold().call(), 1)
        assert.deepEqual(await safe.methods.getOwners().call(), [ accounts[8] ])
        assert.deepEqual(await safe.methods.getModules().call(), [])
        assert.equal(web3.utils.toWei("0.7331"), await web3.eth.getBalance(safe.options.address))
    })
    */
})

