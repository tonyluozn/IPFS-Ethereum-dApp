import web3 from './web3';
//access our local copy to contract deployed on rinkeby testnet
//use your own contract address
const address = '0xaEd736D1b3d3cB35be456c9dC4D7F7CA63A78408';
//use the ABI from your contract
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "symbol_",
				"type": "bytes32"
			},
			{
				"name": "address_",
				"type": "address"
			}
		],
		"name": "addNewToken",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "symbol_",
				"type": "bytes32"
			}
		],
		"name": "removeToken",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "symbol_",
				"type": "bytes32"
			},
			{
				"name": "to_",
				"type": "address"
			},
			{
				"name": "amount_",
				"type": "uint256"
			}
		],
		"name": "transferTokens",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from_",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to_",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount_",
				"type": "uint256"
			}
		],
		"name": "TransferSuccessful",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from_",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to_",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "amount_",
				"type": "uint256"
			}
		],
		"name": "TransferFailed",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "ERC20Interface",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "tokens",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			},
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "transactionIndexesToSender",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "transactions",
		"outputs": [
			{
				"name": "contract_",
				"type": "address"
			},
			{
				"name": "to_",
				"type": "address"
			},
			{
				"name": "amount_",
				"type": "uint256"
			},
			{
				"name": "failed_",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

export default new web3.eth.Contract(abi, address);