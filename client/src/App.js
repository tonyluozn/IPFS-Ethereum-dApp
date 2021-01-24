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
import { Container, Table, Button, Form, Row,Col,ListGroup,Tabs,Tab,DropdownButton,Dropdown} from 'react-bootstrap';
import ViewNews from "./ViewNews";
import {DownCircleTwoTone, UpCircleTwoTone,DownOutlined,UpOutlined}from '@ant-design/icons';
import Receipt from "./Receipt";
/* global BigInt */
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
    //get user's metamask account address
    this.getWalletAddress();

    // this.getReputation();

    this.updateNews();

    // approve the spender to spend on contract creator's behalf, calling this only once
    //this.approve();
  }

  //loading the list of hash from the deployed storeHash contract
  updateNews = async() => {
    const newsfeed = await storehash.methods.getUpdate().call()
    .then(
      (result) => {
        return result;
      }
    )

    console.log("Before update:" + this.state.newsList)
    this.setState({newsList: newsfeed})
    console.log("After update:" + this.state.newsList)
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
    extension: '',
    // where we store address for deployed contract
    contractAddress:'',
    verified:true,
    // two buffer for two seperate files
    textBuffer:'',
    imageBuffer:'',
    //value for post category
    category: '',
    blockNumber:'',
    transactionHash:'',
    gasUsed:'',
    txReceipt: '',
    walletAddress:'' ,
    reputation:0,
    token_balance:0,
    newsList:[],
    username: '',
    // text box value for new userName
    nameField:'',
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

  getWalletAddress = async() => {
    const accounts =  await web3.eth.getAccounts();
    this.setState({walletAddress: accounts[0]});
    console.log('Fetching address '+this.state.walletAddress);

    // Check if wallet address exists
    if (this.state.walletAddress != '') {
      this.updateReputation();
      this.getTokenBalance();
      this.getUsername(accounts[0]);
    }
  }



  // what is this?
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
  // For the text however, they are saved to the textBuffer once we click submit.
  captureFile = (event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let fileExt = file.name.split('.').pop()
        console.log("File name extension is:" + fileExt)
        this.setState({ extension: fileExt})
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
    console.log('Set report category to: ' + this.state.category);
    event.preventDefault();
    //convert the text report to buffer
    const file = new Blob([this.state.value], {type: 'text/plain'});

    console.log("Text input value: " + this.state.value);

    // read text input as buffer
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => this.convertTextToBuffer(reader);

    //obtain contract address from storehash.js
    const contractAddress= await storehash.options.address;
    console.log("ETH address is:" + contractAddress);
    this.setState({contractAddress});

    // check if verified
    if (this.state.token_balance >= 10){
      this.setState({verified: true});
    }
    console.log("User is verified? " + this.state.verified);

    //submit both image and text to ipfs network, save two returned hashes to states.

    //If there is no image, the buffer is ''
    if(this.state.imageBuffer !== ''){
      console.log(this.state.textBuffer);

      await ipfs.add(this.state.textBuffer, async (err, ipfsHash) => {
        console.log("error message:"+err);
        this.setState({ ipfsHash:ipfsHash[0].hash });

        await ipfs.add(this.state.imageBuffer, (err, imageHash) => {
            this.setState({ imageHash:imageHash[0].hash });
            const time = new Date().toLocaleString();

            if(this.state.verified)  {
              storehash.methods.sendUpdate(this.state.ipfsHash,this.state.location,
                time,this.state.imageHash,this.state.category, this.state.extension).send({
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
            time,'',this.state.category).send({
              from: this.state.walletAddress
            }, (error, transactionHash) => {
              this.setState({transactionHash});
            }); //storehash
        }
      })
    }

  };

  getTransactionReceipt = async () => {
    try{
      this.setState({
        blockNumber: "waiting..",
        gasUsed: "waiting..."
      });

      //get Transaction Receipt in console on click
      //See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
              console.log(err,txReceipt);
              this.setState({txReceipt});
            });

      //await for getTransactionReceipt
      await this.setState({blockNumber: this.state.txReceipt.blockNumber});
      await this.setState({gasUsed: this.state.txReceipt.gasUsed});
    }

    catch(error){
      console.log(error);
    }

  }


  // for any user who has metamask, send the ERC-20 tokens to the account.
  getToken = async () => {
    const amount = BigInt(1000000000000000000);
    healthToken.methods.transfer('0x3C9c010366aEd756647B83BC0120B925c41D9bf8', amount).send({
      from: this.state.walletAddress
    },(error,tokenTransactionHash) => {
      console.log('token transaction successfull with the tansaction hash: ' + tokenTransactionHash);
    });
  }

  // for testing purpose
  testGetToken = async (address) => {
    console.log(`user ${address} at adress will get token`);
  }

  // get the user reputation
  updateReputation = async() => {
      const address = this.state.walletAddress;
      const repu = await storehash.methods.getReputation(address).call().then((result) => {
        console.log(result);
        return result;
      });
    // console.log(this.state.reputation);
    this.setState({reputation: repu});
    // console.log(this.state.reputation);
  }

  //To capture the reputation of the message poster
  returnReputation = async(userAddress) => {
    const address = userAddress;
    const repu = await storehash.methods.getReputation(address).call().then((result) => {
      //console.log("This is the repu " + result + (result > 0));
      return result});
    console.log(repu > 0)
    return repu > 0;
  }

  //Update balance and verified state right after getting the token balance
  getTokenBalance = async() => {
    const address = this.state.walletAddress;
    const balance = await healthToken.methods.balanceOf(address).call();
    this.setState({token_balance: balance/1000000000000000000});

    if(this.state.token_balance > 5){
      this.setState({verified: true});
    }
  }

  // report post
  reportPost = async (address,hash) => {
    console.log('call reportPost function');
    storehash.methods.decreaseReputation(address, 1).send({
      from: this.state.walletAddress
    });
    storehash.methods.decreaseVote(hash).send({
      from: this.state.walletAddress
    });
    this.updateReputation();
  }

  upvotePost = async (address,hash) => {
    console.log('call upVote function');
    storehash.methods.increaseReputation(address, 1).send({from: this.state.walletAddress});
    storehash.methods.increaseVote(hash).send({
      from: this.state.walletAddress
    });
    this.updateReputation();
  }


  // get the user name
  updateUsername = async() => {
      const address = this.state.walletAddress;
      console.log('call updateUsername function');
      const name = await storehash.methods.getUsername(address).call().then((result) => {
        // console.log(result);
        return result;
      });
     console.log("before update: "+this.state.username);
     this.setState({username: web3.utils.hexToAscii(name)});
     console.log("after update: "+name);
  }

  editUsername = async () => {
    const address = this.state.walletAddress;
    const name = this.state.nameField;
    console.log('call editUsername function');
    console.log("state: "+name+" field: "+this.state.username);
    // change username on chain only if textField is nonempty and not the same as username
    if (!(!name || 0 === name.length)){
      console.log('name being processed: '+name);
      storehash.methods.setUsername(address, web3.utils.asciiToHex(name)).send({from: this.state.walletAddress});
    }
    this.updateUsername();
  }

  getUsername = async(address) => {

    var name = await storehash.methods.getUsername(address).call().then((result) => {
      console.log('fetched name: '+result);
      return result;
    });
    name = web3.utils.hexToAscii(name);
    this.setState({username: name});
    return name;
  }


  renderNews = (data) => {
    return data.slice(0).reverse().map((update,index) =>
    <ListGroup.Item key={index}>
    <Row>
      <Col xs={8} style={{ display: "flex", alignItems:"center",textOverflow: "clip" }}>
        User: {update.username}
      </Col>
      <Col>
          <ViewNews update={update} user={this.state.walletAddress}/>
      </Col>
      <div style={{
        display:'inline',
        marginLeft: "16px",
        marginRight: "16px",
        backgroundColor:"#8080807a",
        borderRadius: "5px",
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'}}
      >
        <DownOutlined
        style={{ fontSize: '16px', marginLeft:"4px"}}
        onClick = {()=>this.reportPost(update.user,update.ipfsHash)}
        />
        <UpOutlined
        style={{ fontSize: '16px', marginLeft:"4px", marginRight:"4px" }}
        onClick = {()=>this.upvotePost(update.user,update.ipfsHash)}
        />
      </div>
    </Row>
    <Row>
      <Col style={{ display: "flex"}}>Location: {update.location}</Col>
      <Col offset={6} style={{ textAlign: "center" }}>Submitted on: {update.timeStamp}</Col>
    </Row>
    {/* <Row>
      <Col>Category: {update.category}</Col>
    </Row> */}
    </ListGroup.Item>);
  }

render() {
      const news_total = this.state.newsList.length;
      const free_posts = this.state.newsList.filter(e=>e.category=='free');
      const premium_posts = this.state.newsList.filter(e=>e.category=='premium');

        return (
        <div className="App">
        <p className="App-header">Northwestern Covid-19 News-Sharing Platform</p>
          <hr />
          <Row>
            <Col>
                <strong>News update</strong>
                <hr />
                <Tabs defaultActiveKey="free" id="tab">
                <Tab eventKey="free" title="Free">
                <div className="list-wrapper">
                  <p>{this.renderNews(free_posts)}</p>
                </div>
                </Tab>
                <Tab eventKey="premium" title="Premium">
                <div className="list-wrapper">
                  <p>{this.renderNews(premium_posts)}</p>
                </div>
                </Tab>
              </Tabs>

            </Col>
            <Col>
            <Container>
              <Row>
                <Col span={8}>
                  <p> Metamask account: {this.state.walletAddress}</p>
                  <p> Username: {this.state.username}</p>
                  <p> reputation: {this.state.reputation} </p>
                  <p> NUHT token balance: {this.state.token_balance} </p>
                </Col>
                <div className="button">
                  <Button bsStyle="primary" style={{width:"130px"}} type="submit" onClick = {this.getToken} >Get Token</Button>
                </div>
              </Row>

              <hr />

                <Row>
                  <Col xs={8}>
                    <textarea className="nameInputBox" rows="1" cols="30" onChange={e=>{this.setState({nameField:e.target.value});}}/>
                  </Col>
                  <Col xs={3}>
                    <div className="button">
                      <Button bsStyle="primary" style={{width:"130px"}} type="submit" onClick={this.editUsername}> Set Name</Button>
                      </div>
                  </Col>
                </Row>

              <hr />

              <Form onSubmit={this.updateSubmit}>
                <Row>
                  <Col xs={3}>Report</Col>
                  <Col xs={8}><textarea className="textInputBox" onChange={e=>{this.setState({value:e.target.value});}}/></Col>
                </Row>

                <Row>
                  <Col xs={3}>Location</Col>
                  <Col xs={8}><textarea className="locationInputBox" onChange={e=>{this.setState({location:e.target.value});}}/></Col>
                </Row>

                <Row>
                  <Col xs={{span:10, offset: 1}} style={{ display: "flex"}}>
                    <Form.Control
                      as="select"
                      custom
                      onChange={e=>{this.setState({category:e.target.value}); console.log(this.state.category)}}
                    >
                      <option value="choose">Choose a category: </option>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </Form.Control>
                  </Col>
                </Row>

                <br/>

                <Row>
                  <Col xs={9}>
                    <input className="input" type = "file" onChange = {this.captureFile}/>
                  </Col>
                  <Col xs={3}>
                    <div className="button">
                      <Button bsStyle="primary" style={{width:"130px"}}type="submit" > Submit
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
              <hr/>

          <Button onClick = {this.getTransactionReceipt}> Get Transaction Receipt </Button>
          <hr />
          <Receipt ipfsHash={this.state.ipfsHash} imageHash={this.state.imageHash}
                   contractAddress={this.state.contractAddress} transactionHash={this.state.transactionHash}
                   blockNumber={this.state.blockNumber} gasUsed={this.state.gasUsed}/>
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
