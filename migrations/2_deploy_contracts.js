var StoreHash = artifacts.require("./StoreHash.sol");
var NUHealthToken = artifacts.require("./NUHealthToken.sol");

module.exports = function(deployer) {
  deployer.deploy(StoreHash);
};

module.exports = function(deployer) {
  deployer.deploy(NUHealthToken);
};