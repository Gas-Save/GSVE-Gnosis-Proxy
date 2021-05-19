/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
var json = require('./keys.json'); 

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "5777"
    },
	developmentcli: {
      host: "localhost",
      port: 8545,
      network_id: "5777"
    },  
	ropsten: {
		provider: function() {
		  return new HDWalletProvider([json['mnemonic1'], json['mnemonic2'], json['mnemonic3']], "wss://ropsten.infura.io/ws/v3/" + json['infura']);
		},
    network_id: '3',
  },
  	rinkeby: {
		provider: function() {
		  return new HDWalletProvider([json['mnemonic1'], json['mnemonic2'], json['mnemonic3']], "wss://eth-rinkeby.ws.alchemyapi.io/v2/" + json['alchemy']);
		},
    network_id: '4',
  },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(json['mnemonic1'], "https://mainnet.infura.io/v3/" + json['infura'])
      },
      network_id: 1
    },
  },
  plugins: ["solidity-coverage", 'truffle-plugin-verify'],
  api_keys: {
    etherscan: json['etherscan']
  },
  // Set default mocha options here, use special reporters etc.
  mocha: { /* https://github.com/cgewecke/eth-gas-reporter
    reporter: 'eth-gas-reporter',
    reporterOptions : {
      currency: 'USD',
      gasPrice: 1,
      onlyCalledMethods: true,
      showTimeSpent: true,
      excludeContracts: ['Migrations']
    }*/
  },
  // Configure your compilers
 compilers: {
    solc:{
		version: "^0.8.0",
		settings: {
		optimizer: {
			  enabled: true,
			  runs: 200   // Optimize for how many times you intend to run the code
			},
      },
	},
  },
}

