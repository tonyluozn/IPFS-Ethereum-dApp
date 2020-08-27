import React, { Component } from 'react';
//import logo from ‘./logo.svg’;
import './App.css';
import web3 from './web3';
import Web3 from 'web3';
import ipfs from './ipfs';
import storehash from './storehash';
import healthToken from './healthToken';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Button, Form, Row,Col} from 'react-bootstrap';

//force the browser to connect to metamask upon entering the site
window.addEventListener('load', async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */});
      } catch (error) {}
  }
  // Legacy dapp browsers...
  else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */});
  }
  // Non-dapp browsers...
  else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
});

class App extends Component {
 
  constructor() {
    super();
    //bring in user's metamask account address
    this.getWalletAddress();
  }

  //loading the list of hash from the deployed storeHash contract
  componentDidMount() {
    storehash.methods.getHash().then(
      arr => this.setState({hashList: arr})
    )
  }

  state = {
    ipfsHash:null,
    verified:true,
    buffer:'',
    ethAddress:'',
    blockNumber:'',
    transactionHash:'',
    gasUsed:'',
    txReceipt: '',
    walletAddress:'' ,
    hashList:[]
  };  

  getWalletAddress = async() =>{
    const accounts =  await web3.eth.getAccounts();
    console.log('Metamask account: ' + accounts[0]);
    this.state = {
      walletAddress: accounts[0]
    };
  }

  captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)    
      };
  convertToBuffer = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        this.setState({buffer});
    };
    
  onClick = async () => {
    try{
          this.setState({blockNumber:"waiting.."});
          this.setState({gasUsed:"waiting..."});
    //get Transaction Receipt in console on click
    //See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
    await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
            console.log(err,txReceipt);
            this.setState({txReceipt});
          }); //await for getTransactionReceipt
    await this.setState({blockNumber: this.state.txReceipt.blockNumber});
          await this.setState({gasUsed: this.state.txReceipt.gasUsed});    
        } //try
      catch(error){
          console.log(error);
        } //catch
  } //onClick
  onSubmit = async (event) => {
    event.preventDefault();
    //obtain contract address from storehash.js
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});
    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err,ipfsHash);
        //setState by setting ipfsHash to ipfsHash[0].hash 
        this.setState({ ipfsHash:ipfsHash[0].hash });
     // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
    //return the transaction hash from the ethereum contract
    //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
      // if the user has the tokens, 

      if(this.verified)  {
        storehash.methods.sendHash(this.state.ipfsHash).send({
          from: this.walletAddress
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({transactionHash});
        }); //storehash 
      }
      }) //await ipfs.add 
    }; //onSubmit


    // for any user who has metamask, send the ERC-20 tokens to the account.
    getToken = async () => {
      healthToken.methods.transfer(this.walletAddress,1000).send({
        // creator of the contract?
        from: ''
      },(error,tokenTransactionHash) =>{
        console.log('token transaction successfull with the tansaction hash: '+tokenTransactionHash);
      });

    }


render() {
      
      return (
        <div className="App">
        <p className="App-header">Northwestern Covid-19 News-Sharing Platform</p>  
          <hr />
          <Row>
            <Col>
                <p>News update</p>
                <hr />
            </Col>
            <Col>
            <Container>
              <Row>
                <Col><p>Link your Metamask account:</p></Col>
                <Col><Button onClick = {this.getToken}> Get Token</Button></Col>
                
              </Row>
              <hr />
              <Form onSubmit={this.onSubmit}>
            <input 
              type = "file"
              onChange = {this.captureFile}
            />
             <Button 
             bsStyle="primary" 
             type="submit"> 
             Send it 
             </Button>
              </Form>
  
  
          <hr/>
          <Button onClick = {this.onClick}> Get Transaction Receipt </Button>
          <hr />
          <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Tx Receipt Category</th>
                    <th>Values</th>
                  </tr>
                </thead>
               
                <tbody>
                  <tr>
                    <td>IPFS Hash # stored on Eth Contract</td>
                    <td>{this.state.ipfsHash}</td>
                  </tr>
                  <tr>
                    <td>Ethereum Contract Address</td>
                    <td>{this.state.ethAddress}</td>
                  </tr>
                  <tr>
                    <td>Tx Hash # </td>
                    <td>{this.state.transactionHash}</td>
                  </tr>
                  <tr>
                    <td>Block Number # </td>
                    <td>{this.state.blockNumber}</td>
                  </tr>
                  <tr>
                    <td>Gas Used</td>
                    <td>{this.state.gasUsed}</td>
                  </tr>
                
                </tbody>
            </Table>
        </Container>
            </Col>
          </Row>

        <p className="App-header">About</p>
          
          <hr />
     </div>
      );
    } //render
} //App
export default App;