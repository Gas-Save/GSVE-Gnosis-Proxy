var abi = require('ethereumjs-abi')
const { BN, expectRevert, send, ether } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const factoryDetails = artifacts.require('./ProxyFactory.sol')

contract('Safe 1.1.1 Factory', function(accounts) {
    var factory

    it('deploy', async () => {
        factory = await factoryDetails.new()
        console.log(factory.address)
    })
    
    it('deploy with nonce', async () => {
        var creationdata = "0xb63e800d0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000d5d82b6addc9027b22dca772aa68d5d74cdbdf440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000000000000000000000000000000000000000000000000000000000000"
        creationdata = creationdata.replace("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", accounts[0].replace("0x", ""))
        var receipt = await factory.createProxyWithNonce("0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F", creationdata, accounts[0])
        var deployedAddress = await factory.getDeployedAddress.call(accounts[0])
        var deployed = false;
        if (deployedAddress !== "0x0000000000000000000000000000000000000000"){
            deployed = true
        }
        assert.equal(true, deployed);
        console.log(receipt);
    })

})

