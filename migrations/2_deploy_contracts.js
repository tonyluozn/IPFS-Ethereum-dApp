var StoreHashNew = artifacts.require("./StoreHashNew.sol");
var NUHealthToken = artifacts.require("./NUHealthToken.sol");

module.exports = function(deployer) {
  deployer.deploy(StoreHashNew);
};

module.exports = function(deployer) {
  deployer.deploy(NUHealthToken);
};