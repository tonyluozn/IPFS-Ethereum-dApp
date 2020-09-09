import React, { Component } from 'react';
//import logo from ‘./logo.svg’;
import './App.css';
import web3 from './web3';
import Web3 from 'web3';
import ipfs from './ipfs';
import storehash from './storehash';
import healthToken from './healthToken';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Button, Form, Row,Col,ListGroup} from 'react-bootstrap';
import ViewNews from "./ViewNews";

//force the browser to connect to metamask upon entering the site
window.addEventListener('load', async () => {
  // Modern dapp browsers...
  if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
          // Acccounts now exposed
          window.ethereum.enable();
          const accounts = await web3.eth.requestAccounts();
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
    this.updateNews();
  }

  //loading the list of hash from the deployed storeHash contract
  updateNews = async() => {
    const pp = await storehash.methods.getUpdate().call().then(
      (result) => {
        //console.log(result)
        return result
      }
    )
    console.log(this.state.newsList)
    this.setState({newsList: pp})
    console.log(this.state.newsList)
  }
  state = {
    //text file hash
    ipfsHash:null,
    //image file hash
    imageHash:null,
    //text box value for report
    value:'',
    //text box value for location
    location:'',
    ethAddress:'',
    verified:false,
    // two buffer for two seperate files
    textBuffer:'',
    imageBuffer:'',

    blockNumber:'',
    transactionHash:'',
    gasUsed:'',
    txReceipt: '',
    walletAddress:'' ,
    newsList:[],

  };  

  getWalletAddress = async() =>{
    const accounts =  await web3.eth.getAccounts();
    this.setState({walletAddress: accounts[0]});
    //console.log('print out address '+this.state.walletAddress);
  }
  
  textSubmit(event) {
    event.preventDefault();
    const element = document.createElement("a");
    const file = new Blob([this.state.value], {type: 'text/plain'});
    console.log("state.value: "+this.state.value);
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.convertToBuffer(reader);
      this.imageSubmit(event);
    }
  }

  // Image saved to imageBuffer once we select the file
  //for the text however, they are saved to the textBuffer once we click submit.
  captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertImageToBuffer(reader)    
      };
  convertImageToBuffer = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer -using es6 syntax
        this.setState({imageBuffer: buffer});
  };
  convertTextToBuffer = async(reader) => {
    //file is converted to a buffer for upload to IPFS
      const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
      this.setState({textBuffer: buffer});
};
  
  //first, convert the report text to buffer, then send the combined update to blockchain. 
  updateSubmit = async (event) => {
    event.preventDefault();
    //convert the text report to buffer
    const file = new Blob([this.state.value], {type: 'text/plain'});
    console.log("state.value: "+this.state.value);
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertTextToBuffer(reader)    

    //obtain contract address from storehash.js
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});
    const balance = await healthToken.methods.balanceOf(this.state.walletAddress).call();
    console.log("Balance of the tokens: "+balance)
    if (balance >= 1000){
      this.setState({verified: true})
    }

    //submit both image and text to ipfs network, save two returned hashes to states.
    await ipfs.add(this.state.textBuffer, async (err, ipfsHash) => {
      this.setState({ ipfsHash:ipfsHash[0].hash });
      await ipfs.add(this.state.imageBuffer, (err, imageHash) => {
          // console.log('img....:',this.state.imageBuffer);
          // console.log('img....:',imageHash[0].hash);
          this.setState({ imageHash:imageHash[0].hash });
          // console.log('img....:',this.state.imageHash);
          const time = new Date().toLocaleString();
          if(this.state.verified)  {
            storehash.methods.sendUpdate(this.state.ipfsHash,this.state.location,
              time,this.state.imageHash).send({
              from: this.state.walletAddress
            }, (error, transactionHash) => {
              //console.log(transactionHash);
              this.setState({transactionHash});
              //console.log(storehash.methods.getHash())
            }); //storehash 
            this.testGetToken(this.state.walletAddress);
          }
        });
      }) 
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

    // for any user who has metamask, send the ERC-20 tokens to the account.
    getToken = async () => {
      healthToken.methods.transfer(this.state.walletAddress,1000).send({
        // creator of the contract?
        from: ''
      },(error,tokenTransactionHash) =>{
        console.log('token transaction successfull with the tansaction hash: '+tokenTransactionHash);
      });
    }

    // for testing purpose
    testGetToken = async (address) => {
      console.log(`user ${address} at adress will get token`);
    }


render() {

      const updateItems = this.state.newsList.map((update,index) =>
      <ListGroup.Item key={index}>
      <Row>
        <Col xs={8} style={{ display: "flex"}}>
          <Container style={{ display: "flex", alignItems:"center",textOverflow: "clip" }}>User: {update.user}</Container>
        </Col>
        <Col >
            <ViewNews hash={update} view={index<4||this.state.verified}/>
          </Col>
          <Col>
            <Button variant="outline-dark" >Report</Button>
          </Col>
      </Row>
      <Row>
        <Col>Location: {update.location}</Col>
        <Col offset={5}>Submitted on: {update.timeStamp}</Col>
      </Row>
  </ListGroup.Item>);
      
        return (
        <div className="App">
        <p className="App-header">Northwestern Covid-19 News-Sharing Platform</p>  
          <hr />
          <Row>
            <Col>
                <strong>News update</strong>
                <hr />
                <div className="list-wrapper">
                  <p>{updateItems}</p>
                </div>                     
                
            </Col>
            <Col>
            <Container>
              <Row>
                
                <Col span={8}><p>Link your Metamask account: {this.state.walletAddress}</p></Col>
                <div className="button"><Button bsStyle="primary"style={{width:"130px"}} type="submit" onClick = {this.getToken} > Get Token</Button></div>
              </Row>
              <hr />

              <Form onSubmit={this.updateSubmit}>
              <Row>
              <Col span={3}>Report</Col>
              <Col span={8}><textarea className="textInputBox" onChange={e=>{this.setState({value:e.target.value});}}/></Col>
              </Row>

              <Row>
              <Col span={3}>Location</Col>
              <Col span={8}><textarea className="locationInputBox" onChange={e=>{this.setState({location:e.target.value});}}/></Col>
              </Row>
              <br/>
              <Row>
                <Col span={5}></Col>
                <Col><input className="input" type = "file" onChange = {this.captureFile}/></Col>
                <Col><div className="button"><Button bsStyle="primary" style={{width:"130px"}}type="submit" > Submit </Button></div>
                </Col>
              </Row>
            
                
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
                    <td>IPFS Hash of text stored on Eth Contract</td>
                    <td>{this.state.ipfsHash}</td>
                  </tr>
                  <tr>
                    <td>IPFS Hash of image stored on Eth Contract</td>
                    <td>{this.state.imageHash}</td>
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