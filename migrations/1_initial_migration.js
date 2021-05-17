const GSVEGNOSISFACTORY = artifacts.require('./ProxyFactory.sol')
const beaconJson = require("./../build/contracts/GSVEBeacon.json")

module.exports = async(deployer) => {
  var beaconAddress = "0xf9830eAE8e249dA1E805eda7B44390B3E554BE8D"
  var gsveAddress = "0x8C5Ba9e01A9e45578163B23fA0f2Ef49fb2c7b38"

  var factory = await deployer.deploy(GSVEGNOSISFACTORY, gsveAddress, beaconAddress)

  var beacon = await new web3.eth.Contract(beaconJson['abi'], beaconAddress);
  var account = await web3.eth.getAccounts()
  await beacon.methods.transferOwnership(GSVEGNOSISFACTORY.address).send({from:account[0]})
  console.log("gnois factory: " + GSVEGNOSISFACTORY.address)
};