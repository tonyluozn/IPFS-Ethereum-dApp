import React, { Component } from 'react';
//import logo from ‘./logo.svg’;
import './App.css';
import web3 from './web3';
import Web3 from 'web3';
import ipfs from './ipfs';
import storehash from './storehash';
import healthToken from './healthToken';
import transferToken from './transferToken';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Button, Form, Row,Col,ListGroup} from 'react-bootstrap';
import ViewNews from "./ViewNews";
import {DownCircleTwoTone, UpCircleTwoTone,DownOutlined,UpOutlined}from '@ant-design/icons';

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
    // this.getReputation();
    this.updateNews();
    // approve the spender to spend on contract creator's behalf, calling this only once
    //this.approve();
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
    verified:true,
    // two buffer for two seperate files
    textBuffer:'',
    imageBuffer:'',

    blockNumber:'',
    transactionHash:'',
    gasUsed:'',
    txReceipt: '',
    walletAddress:'' ,
    reputation:0,
    token_balance:0,
    newsList:[],
    //Byte32 for 'NUHT'
    tokenByte: '0x4e55485400000000000000000000000000000000000000000000000000000000',
    required_token:10*1000000000000000000,
    

  };  

 // approve = async () => {
 //   const amount = 1000000000;
 //   healthToken.methods.approve('0xaEd736D1b3d3cB35be456c9dC4D7F7CA63A78408',amount).call({
 //     from: '0x65bA114024121a991865e9130B196cA9E504E262'
 //   }, (error, transactionHash) => {
 //     console.log("spender approved. Transaction hash: "+ transactionHash);
 //   }); 
 // }

  getWalletAddress = async() =>{
    const accounts =  await web3.eth.getAccounts();
    this.setState({walletAddress: accounts[0]});
    console.log('print out address '+this.state.walletAddress);
    console.log('current address', this.state.walletAddress);
    if (this.state.walletAddress != '') {
      this.getReputation()
      this.getTokenBalance()
    }
    
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

    if (this.state.token_balance >= 10){
      this.setState({verified: true})
    }
    console.log(this.state.verified)
    //submit both image and text to ipfs network, save two returned hashes to states.
    
    //If there is no image, the buffer is ''
    if(this.state.imageBuffer !== ''){
      console.log(this.state.textBuffer) 
      await ipfs.add(this.state.textBuffer, async (err, ipfsHash) => {
        this.setState({ ipfsHash:ipfsHash[0].hash });
        await ipfs.add(this.state.imageBuffer, (err, imageHash) => {
            this.setState({ imageHash:imageHash[0].hash });
            const time = new Date().toLocaleString();
            if(this.state.verified)  {
              storehash.methods.sendUpdate(this.state.ipfsHash,this.state.location,
                time,this.state.imageHash).send({
                from: this.state.walletAddress
              }, (error, transactionHash) => {
                this.setState({transactionHash});
              }); //storehash 
              this.testGetToken(this.state.walletAddress);
            }
          });
        }) 
    }
    else{ //we only want to send the text
      console.log(this.state.textBuffer)
      await ipfs.add(this.state.textBuffer, async (err, ipfsHash) => {
        this.setState({ ipfsHash:ipfsHash[0].hash });
        const time = new Date().toLocaleString();
        if(this.state.verified){
          //Trying to use '' as an image hash/place holder
          storehash.methods.sendUpdate(this.state.ipfsHash,this.state.location,
            time,'').send({
              from: this.state.walletAddress
            }, (error, transactionHash) => {
              this.setState({transactionHash});
            }); //storehash 
        }
      }) 
    }
    
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
      transferToken.methods.transferTokens(this.state.tokenByte,this.state.walletAddress,10).send({
        // creator of the contract? 
        from: '0x65bA114024121a991865e9130B196cA9E504E262'
      },(error,tokenTransactionHash) =>{
        console.log('token transaction successfull with the tansaction hash: '+tokenTransactionHash);
      });
    }

    // for testing purpose
    testGetToken = async (address) => {
      console.log(`user ${address} at adress will get token`);
    }

    // get the user reputation
    getReputation = async() =>{
      const address = this.state.walletAddress
      const repu = await storehash.methods.getReputation(address).call().then((result) => {
        console.log(result);
        return result});
    // console.log(this.state.reputation);
    this.setState({reputation: repu});
    // console.log(this.state.reputation);
  }

  getTokenBalance = async() =>{
    const address = this.state.walletAddress
    const balance = await healthToken.methods.balanceOf(address).call();
  this.setState({token_balance: balance/1000000000000000000});
}

    // report post 
    reportPost = async (address) => {
      console.log('call reportPost function');
      const de_repu = 5;
      storehash.methods.decreaseReputation(address, de_repu).send({from: this.state.walletAddress});
      this.getReputation();
    }

    upvotePost = async (address) => {
     
    }


render() {
      const news_total = this.state.newsList.length;
      const updateItems = this.state.newsList.slice(0).reverse().map((update,index) =>
      <ListGroup.Item key={index}>
      <Row>
        <Col xs={8} style={{ display: "flex"}}>
          <Container style={{ display: "flex", alignItems:"center",textOverflow: "clip" }}>User: {update.user}</Container>
        </Col>
        <Col >
            <ViewNews repu = {this.state.reputation > 0} hash={update} view={index<4||this.state.verified} image = {update.imageHash == ''}/>
          </Col>
          <Col>
            <DownOutlined style={{ fontSize: '20px' }} onClick = {()=>this.reportPost(update.user)}/>
          </Col>
          <Col>
            <UpOutlined style={{ fontSize: '20px' }} onClick = {()=>this.upvotePost(update.user)}/>
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
                
                <Col span={8}>
                  <p>Your Metamask account: {this.state.walletAddress}</p>
                  <p> Your reputation: {this.state.reputation} </p> 
                  <p> Your NUHT token balance: {this.state.token_balance} </p> 
                  </Col>
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
                    <th>Transaction Receipt Category</th>
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