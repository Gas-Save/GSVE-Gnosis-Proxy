var abi = require('ethereumjs-abi')
const { BN, expectRevert, send, ether } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const factoryDetails = artifacts.require('./ProxyFactory.sol')
const GSVE_helper = artifacts.require("./test_helpers/GSVE_helper.sol");
const TokenJson = require("./../build/contracts/GSVEToken.json")
const GnosisSafe = require('@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json')
const WrappedGasToken = require("./../build/contracts/WrappedGasToken.json")

contract('GSVE Gnosis Safe Factory', function(accounts) {
    var factory
    var deployedSafe
    var helper
    var gasToken

    it('deploy', async () => {
        factory = await factoryDetails.new("0x57E6e4aAf485Bc838F2127A0F8321684EEf75C8b")
        helper = await GSVE_helper.new();
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
        var contract = await new web3.eth.Contract(contact_abi, "0x57E6e4aAf485Bc838F2127A0F8321684EEf75C8b");
        await contract.methods.approve(factory.address, web3.utils.toWei("50")).send({ from: accounts[0] })

        var receipt = await factory.createProxyWithNonce("0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F", creationdata, accounts[0])
        var deployedAddress = await factory.getDeployedAddress.call(accounts[0])
        var deployed = false;
        if (deployedAddress !== "0x0000000000000000000000000000000000000000"){
            deployed = true
        }
        assert.equal(true, deployed);
    })

    it('get the deployed safe', async () => {
        var deployedAddress = await factory.getDeployedAddress.call(accounts[0])
        var contact_abi = GnosisSafe['abi'];
        deployedSafe = await new web3.eth.Contract(contact_abi, deployedAddress);
    })

    it('burn gas to find baseline cost', async function () {
        var receipt = await helper.burnGas(120000);
        console.log(`GasUsed: ${receipt.receipt.gasUsed}`);
    });

    it('burn gas to find baseline cost', async function () {
        gasToken = await new web3.eth.Contract(WrappedGasToken['abi'], "0x0000000000004946c0e9F43F4Dee607b0eF1fA1c");
        await gasToken.methods.mint(10).send({from: accounts[0], gas: 1000000 })
        await gasToken.methods.approve(helper.address, 10).send({from: accounts[0], gas: 1000000 })

        var receipt = await helper.burnGas(120000);
        console.log(`GasUsed: ${receipt.receipt.gasUsed}`);
    });
})

