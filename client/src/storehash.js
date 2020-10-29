import web3 from './web3';
import { storehash } from './contracts/Storehash.json';
//access our local copy to contract deployed on rinkeby testnet
//use your own contract address
const networkId = await web3.eth.net.getId();
const deployedNetwork = storehash.networks[networkId];
const Storehash = new web3.eth.Contract(
	storehash.abi,
	deployedNetwork && deployedNetwork.address,
);
export default Storehash;