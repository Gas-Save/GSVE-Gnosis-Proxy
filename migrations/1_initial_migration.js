const GSVEGNOSISFACTORY = artifacts.require('./ProxyFactory.sol')
const beaconJson = require("./../build/contracts/GSVEBeacon.json")

module.exports = async(deployer) => {
  var beaconAddress = "0x70Aee69e2CbbC02Fb387a5915318CD6c88Df4c96"
  var gsveAddress = "0x5D2BA218Dfa6c374397B262789D9700C2A36B725"

  var factory = await deployer.deploy(GSVEGNOSISFACTORY, gsveAddress, beaconAddress)

  var beacon = await new web3.eth.Contract(beaconJson['abi'], beaconAddress);
  var account = await web3.eth.getAccounts()
  await beacon.methods.transferOwnership(GSVEGNOSISFACTORY.address).send({from:account[0]})
  console.log("gnois factory: " + GSVEGNOSISFACTORY.address)
};