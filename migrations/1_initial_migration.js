const GSVEGNOSISFACTORY = artifacts.require('./ProxyFactory.sol')
const beaconJson = require("./../build/contracts/GSVEBeacon.json")
const ownable = artifacts.require("Ownable.sol")

module.exports = async(deployer) => {
  var beaconAddress = "0xf9830eAE8e249dA1E805eda7B44390B3E554BE8D"
  var gsveAddress = "0x8C5Ba9e01A9e45578163B23fA0f2Ef49fb2c7b38"

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