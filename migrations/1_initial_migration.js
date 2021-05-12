const GSVEGNOSISFACTORY = artifacts.require('./ProxyFactory.sol')
const beaconJson = require("./../build/contracts/GSVEBeacon.json")

module.exports = async(deployer) => {
  var beaconAddress = "0x98DEA83628a522AF9F70c5201DdD60Df78B2fD93"
  var gsveAddress = "0x5850A39A206338ad387D338347DA93F72DF27E62"

  var factory = await deployer.deploy(GSVEGNOSISFACTORY, gsveAddress, beaconAddress)

  var beacon = await new web3.eth.Contract(beaconJson['abi'], beaconAddress);
  var account = await web3.eth.getAccounts()
  await beacon.methods.transferOwnership(GSVEGNOSISFACTORY.address).send({from:account[0]})
  console.log("gnois factory: " + GSVEGNOSISFACTORY.address)
};