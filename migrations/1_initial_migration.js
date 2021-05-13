const GSVEGNOSISFACTORY = artifacts.require('./ProxyFactory.sol')
const beaconJson = require("./../build/contracts/GSVEBeacon.json")

module.exports = async(deployer) => {
  var beaconAddress = "0x8EBBB79228A5b5C2E6EC718201405825b4D48454"
  var gsveAddress = "0x13B4ecB7aF446b006b78A900f2D75A4FB2dc639a"

  var factory = await deployer.deploy(GSVEGNOSISFACTORY, gsveAddress, beaconAddress)

  var beacon = await new web3.eth.Contract(beaconJson['abi'], beaconAddress);
  var account = await web3.eth.getAccounts()
  await beacon.methods.transferOwnership(GSVEGNOSISFACTORY.address).send({from:account[0]})
  console.log("gnois factory: " + GSVEGNOSISFACTORY.address)
};