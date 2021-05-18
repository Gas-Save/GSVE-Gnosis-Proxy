const GSVEGNOSISFACTORY = artifacts.require('./ProxyFactory.sol')
const beaconJson = require("./../build/contracts/GSVEBeacon.json")
const ownable = artifacts.require("Ownable.sol")

module.exports = async(deployer) => {
  var beaconAddress = "0x1370CAf8181771871cb493DFDC312cdeD17a2de8"
  var gsveAddress = "0x000000000000e01999859eebfE39ECd039f67a54"

  var factory = await deployer.deploy(GSVEGNOSISFACTORY, gsveAddress, beaconAddress)

  try{
    var beacon = await ownable.at(beaconAddress)
    await beacon.transferOwnership(GSVEGNOSISFACTORY.address)
  }
  catch{
    console.log("error with transfering ownership of beacon")
  }
  console.log("gnois factory: " + GSVEGNOSISFACTORY.address)
};