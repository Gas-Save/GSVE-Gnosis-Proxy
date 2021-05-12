var abi = require('ethereumjs-abi')
const { BN, expectRevert, send, ether } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const factoryDetails = artifacts.require('./ProxyFactory.sol')
const GSVE_helper = artifacts.require("./test_helpers/GSVE_helper.sol");
const TokenJson = require("./../build/contracts/GSVEToken.json")
const GnosisSafe = require('@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json')
const WrappedGasToken = require("./../build/contracts/WrappedGasToken.json")
const beaconJson = require("./../build/contracts/GSVEBeacon.json")

contract('GSVE Gnosis Safe Factory', function(accounts) {
    var factory
    var beacon
    var deployedSafe
    var helper
    var gasToken

    var beaconAddress = "0x8AB00E168a143bE2A701455669B4cc1283BCa0Ea"
    var gsveAddress = "0x95E9606968Be0CA5b6529Dfb362063F04B71bC1E"

    it('deploy', async () => {
        factory = await factoryDetails.new(gsveAddress, beaconAddress)
        helper = await GSVE_helper.new();
        console.log(factory.address)
    })

    it('burn gas to find baseline cost', async function () {
        var receipt = await helper.burnGas(40000);
        console.log(`GasUsed: ${receipt.receipt.gasUsed}`);
    });

    it('get the beacon', async () => {
        beacon = await new web3.eth.Contract(beaconJson['abi'], beaconAddress);
    })

    it('get the chi gastoken', async () => {
        gasToken = await new web3.eth.Contract(WrappedGasToken['abi'], "0x0000000000004946c0e9F43F4Dee607b0eF1fA1c");
    })
    
    
    it('burn gas to find how much the transaction costs with the gas token enabled', async function () {
        await beacon.methods.initSafe(helper.address, helper.address).send({from:accounts[0]})
        await gasToken.methods.mint(15).send({from: accounts[0], gas: 1000000 })
        await gasToken.methods.approve(helper.address, 15).send({from: accounts[0], gas: 1000000 })
        var receipt = await helper.burnGas(40000);
        console.log(`GasUsed: ${receipt.receipt.gasUsed}`);
    });

    it('should be able to transfer ownership of beacon to the factory contract', async function () {
        await beacon.methods.transferOwnership(factory.address).send({from:accounts[0]})
    });

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
        var contract = await new web3.eth.Contract(contact_abi, gsveAddress);
        await contract.methods.approve(factory.address, web3.utils.toWei("50")).send({ from: accounts[0] })

        var receipt = await factory.createProxyWithNonce("0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F", creationdata, accounts[0])
        var deployedAddress = await beacon.methods.getDeployedAddress(accounts[0])
        var deployed = false;
        if (deployedAddress !== "0x0000000000000000000000000000000000000000"){
            deployed = true
        }
        assert.equal(true, deployed);
    })

    it('get the deployed safe', async () => {
        var deployedAddress = await beacon.methods.getDeployedAddress(accounts[0])
        var contact_abi = GnosisSafe['abi'];
        deployedSafe = await new web3.eth.Contract(contact_abi, deployedAddress);
    })

})

