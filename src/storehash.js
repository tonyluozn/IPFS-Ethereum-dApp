import web3 from './web3';
//access our local copy to contract deployed on rinkeby testnet
//use your own contract address
const address = '0xe188ad5062E3d9443C67c3D3F9E2f1EEFE7254BE';
//use the ABI from your contract
const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "hash",
				"type": "string"
			}
		],
		"name": "sendHash",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "newValue",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "updatedBy",
				"type": "address"
			}
		],
		"name": "storageUpdate",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getHash",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
export default new web3.eth.Contract(abi, address);