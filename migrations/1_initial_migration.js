const GSVEGNOSISFACTORY = artifacts.require('./ProxyFactory.sol')
const beaconJson = require("./../build/contracts/GSVEBeacon.json")

module.exports = async(deployer) => {
  var beaconAddress = "0x89957528E2Ff5d867C63d7D2BC44A3269646a95e"
  var gsveAddress = "0xEf140A6c03b339A807E55EF0E6A4F56d2f1Ab724"

  var factory = await deployer.deploy(GSVEGNOSISFACTORY, gsveAddress, beaconAddress)

  var beacon = await new web3.eth.Contract(beaconJson['abi'], beaconAddress);
  var account = await web3.eth.getAccounts()
  await beacon.methods.transferOwnership(GSVEGNOSISFACTORY.address).send({from:account[0]})
  console.log("gnois factory: " + GSVEGNOSISFACTORY.address)
};