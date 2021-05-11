var abi = require('ethereumjs-abi')
const { BN, expectRevert, send, ether } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const factoryDetails = artifacts.require('./ProxyFactory.sol')
const TokenJson = require("./../build/contracts/GSVEToken.json")
const GnosisSafe = require('@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json')

contract('Safe 1.1.1 Factory', function(accounts) {
    var factory
    var deployedSafe
    let executor = accounts[8]

    it('deploy', async () => {
        factory = await factoryDetails.new("0x66566B1dc340a6C4eE0EA1867D15347CAa9ec3CC")
        console.log(factory.address)
    })

    it('should revert when trying to deploy but approval not given', async () => {
        var creationdata = "0xb63e800d0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000d5d82b6addc9027b22dca772aa68d5d74cdbdf440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000000000000000000000000000000000000000000000000000000000000"
        creationdata = creationdata.replace("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", accounts[0].replace("0x", ""))
        expectRevert(factory.createProxyWithNonce("0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F", creationdata, accounts[0]), "ERC20: burn amount exceeds allowance");
    });

    it('should revert when trying to deploy but no GSVE', async () => {
    var creationdata = "0xb63e800d0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000d5d82b6addc9027b22dca772aa68d5d74cdbdf440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000000000000000000000000000000000000000000000000000000000000"
    creationdata = creationdata.replace("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", accounts[0].replace("0x", ""))
    expectRevert(factory.createProxyWithNonce("0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F", creationdata, accounts[1]), "ERC20: burn amount exceeds allowance");
    });
    
    it('deploy with nonce', async () => {
        var creationdata = "0xb63e800d0000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000d5d82b6addc9027b22dca772aa68d5d74cdbdf440000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0000000000000000000000000000000000000000000000000000000000000000"
        creationdata = creationdata.replace("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", accounts[0].replace("0x", ""))

        //approve the proxy factory to burn our GSVE token in the creation process!
        var contact_abi = TokenJson['abi'];
        var contract = await new web3.eth.Contract(contact_abi, "0x66566B1dc340a6C4eE0EA1867D15347CAa9ec3CC");
        await contract.methods.approve(factory.address, web3.utils.toWei("50")).send({ from: accounts[0] })

        var receipt = await factory.createProxyWithNonce("0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F", creationdata, accounts[0])
        var deployedAddress = await factory.getDeployedAddress.call(accounts[0])
        var deployed = false;
        if (deployedAddress !== "0x0000000000000000000000000000000000000000"){
            deployed = true
        }
        assert.equal(true, deployed);
        console.log(receipt);
    })

    it('get the deployed safe', async () => {
        var deployedAddress = await factory.getDeployedAddress.call(accounts[0])
        var contact_abi = GnosisSafe['abi'];
        deployedSafe = await new web3.eth.Contract(contact_abi, deployedAddress);
    })
})

