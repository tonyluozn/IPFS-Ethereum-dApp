import web3 from './web3';
//access our local copy to contract deployed on rinkeby testnet
//use your own contract address
const address = '';
//use the ABI from your contract
const abi = []
export default new web3.eth.Contract(abi, address);