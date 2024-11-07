const DecentralizedStoragePlatform= artifacts.require("DecentralizedStoragePlatform");

module.exports = function(deployer) {
  deployer.deploy(DecentralizedStoragePlatform);
};