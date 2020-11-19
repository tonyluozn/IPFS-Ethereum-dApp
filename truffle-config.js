const path = require("path");
var HDWalletProvider = require("truffle-hdwallet-provider");
//replace with your metamask key phrase
const MNEMONIC = '';
module.exports = {
// See <http://truffleframework.com/docs/advanced/configuration>
// to customize your Truffle configuration!
   contracts_build_directory: path.join(__dirname, "client/src/contracts"),
networks: {
   development: {
      network_id: "*",
      host: 'localhost',
      port: 8545,
      gas: 6721975,
      gasPrice: 20000000000
   },
   rinkeby: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/061425f57e8c483ab0620dbcc680a273")
      },
      network_id: 4,
      gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
    }
},
compilers: {
   solc: {
       version: "0.7.0",
       optimizer: {
          enabled: true,
          runs: 200
       }
   }
}
};