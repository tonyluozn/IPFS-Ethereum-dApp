import web3 from './web3';
import Storehash  from './contracts/StoreHash.json';
//access our local copy to contract deployed on rinkeby testnet
//use your own contract address

const contract = web3.eth.net.getId().then( networkId =>{
	console.log("networkID: "+networkId);
	const deployedNetwork = Storehash.networks["1603324889476"];
	console.log("network: "+deployedNetwork);
	return new web3.eth.Contract(
		Storehash.abi,
		deployedNetwork && deployedNetwork.address,
	);
}
)

export default contract;
