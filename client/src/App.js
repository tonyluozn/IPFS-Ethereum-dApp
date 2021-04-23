import React, { Component } from 'react';
//import logo from ‘./logo.svg’;
import './App.css';
import web3 from './web3';
import Web3 from 'web3';
import ipfs from './ipfs';
import storehash from './storehash';
import healthToken from './healthToken';
import MemeToken from './MemeToken';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Table, Button, Form, Row, Col, ListGroup, Tabs, Tab, DropdownButton, Dropdown } from 'react-bootstrap';
import ViewNews from "./ViewNews";
import { DownCircleTwoTone, UpCircleTwoTone, DownOutlined, UpOutlined } from '@ant-design/icons';
import Receipt from "./Receipt";
import Search from "./search"
import { useState } from 'react';
import { Picky } from 'react-picky';
import 'react-picky/dist/picky.css';
import ScrollMenu from 'react-horizontal-scrolling-menu';

// components for the side scrolling menu
const list = [
  { name: "All 👾" },
  { name: "NU 🟣" },
  { name: "Funny 😂" },
  { name: "WTF 🤨" },
  { name: "Awesome 😎" },
  { name: "Wholesome ❤️" },
];

const MenuItem = ({text, selected}) => {
  return <div
    className={`menu-item ${selected ? 'active' : ''}`}
    >{text}</div>;
};

export const Menu = (list, selected) =>
  list.map(el => {
    const {name} = el;

    return <MenuItem text={name} key={name} selected={selected} />;
  });

const Arrow = ({ text, className }) => {
  return (
    <div
      className={className}
    >{text}</div>
  );
};

const ArrowLeft = Arrow({ text: '<', className: 'arrow-prev' });
const ArrowRight = Arrow({ text: '>', className: 'arrow-next' });

const selected = 'item1';

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
      web3.eth.sendTransaction({/* ... */ });
    } catch (error) { }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    // Acccounts always exposed
    web3.eth.sendTransaction({/* ... */ });
  }
  // Non-dapp browsers...
  else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }
});

class App extends Component {

  constructor() {
    super();
    //force the browser to connect to metamask upon entering the site
    window.addEventListener('load', async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Acccounts now exposed
          window.ethereum.enable();
          const accounts = await web3.eth.requestAccounts();
          web3.eth.sendTransaction({/* ... */ });
        } catch (error) { }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */ });
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    });

    this.updateNews();
    this.menuItems = Menu(list, selected);
    //get user's metamask account address
    this.getWalletAddress();

    // this.getReputation();

    // approve the spender to spend on contract creator's behalf, calling this only once
    //this.approve();

  }

  //loading the list of hash from the deployed storeHash contract
  updateNews = async () => {
    const newsfeed = await storehash.methods.getUpdate().call()
      .then(
        (result) => {
          return result;
        }
      );

    console.log("Before update news:" + this.state.newsList)
    this.setState({ newsList: newsfeed })
    console.log("After update news:" + this.state.newsList)
  }


  state = {
    //text file hash
    ipfsHash: null,
    //image file hash
    imageHash: null,
    //text box value for report
    value: '',
    //text box value for location
    location: '',
    extension: '',
    // where we store address for deployed contract
    contractAddress: '',
    verified: true,
    // two buffer for two seperate files
    textBuffer: '',
    imageBuffer: '',
    // for side scroll menu
    tag_selected: '',
    //value for post category
    category: 'Select a Category',
    tags: '',
    blockNumber: '',
    transactionHash: '',
    gasUsed: '',
    txReceipt: '',
    walletAddress: '',
    reputation: 0,
    token_balance: 0,
    newsList: [],
    votedPosts: [],
    username: '',
    bio: '',
    // text box value for new userName
    nameField: '',
    bioField: '',
    // for search bar
    searchField: '',
    //Byte32 for 'NUHT'
    tokenByte: '0x4e55485400000000000000000000000000000000000000000000000000000000',
    required_token: 10 * 1000000000000000000,
    token_address: '0xdBF789d9f3203BFa3e872c245956A6131103789f',
    //for getting tokens
    tokensRequested: 1,
    isReady: true
  };

  onSearchBarInput = e => {
    this.setState({
      searchField: e.target.value
    });
  };

  // approve = async () => {
  //   const amount = 1000000000;
  //   healthToken.methods.approve('0xaEd736D1b3d3cB35be456c9dC4D7F7CA63A78408',amount).call({
  //     from: '0x65bA114024121a991865e9130B196cA9E504E262'
  //   }, (error, transactionHash) => {
  //     console.log("spender approved. Transaction hash: "+ transactionHash);
  //   });
  // }
  // get users' wallet address
  getWalletAddress = async () => {
    await web3.eth.getAccounts().then((accounts) => {
      this.setState({ walletAddress: accounts[0] });
      console.log('Fetching address ' + this.state.walletAddress);

      // Check if wallet address exists
      if (this.state.walletAddress != '') {
        this.updateReputation();
        this.getTokenBalance();
        this.getUsername(accounts[0]);
        this.getBio(accounts[0]);

        // send tokens to the first time users
        // const amount = BigInt(1000000000000000000);
        // await storehash.methods.checkFirstTimeUser(this.state.walletAddress).call().then((result) => {
        //   if(result){
        //     MemeToken.methods.buy(amount).send({
        //       from: this.state.walletAddress
        //     },(error,tokenTransactionHash) => {
        //       console.log('token recieved successfully with the tansaction hash: ' + tokenTransactionHash);
        //     });
        //   }
        // }).catch( error =>
        //   console.log(error)
        // );
      }
    });
    if (this.state.walletAddress != ''){
      const posts = await storehash.methods.getVotedPosts(this.state.walletAddress).call()
        .then((result) => {
          return result;
        });

      this.setState({ votedPosts: posts});
      console.log("After update posts:" + this.state.votedPosts)
    }
  }

  //use Blob to store text in the variable file
  //submit users' typed text
  textSubmit(event) {
    event.preventDefault();
    const element = document.createElement("a");
    const file = new Blob([this.state.value], { type: 'text/plain' });
    console.log("state.value: " + this.state.value);
    let reader = new window.FileReader()
    //read file
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
    this.setState({ extension: fileExt })
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertImageToBuffer(reader)
  };

  convertImageToBuffer = (reader) => {
    //file is converted to a buffer for upload to IPFS
    const buffer = Buffer.from(reader.result);
    //set this buffer -using es6 syntax
    this.setState({ imageBuffer: buffer });
  };

  convertTextToBuffer = (reader) => {
    //file is converted to a buffer for upload to IPFS
    this.setState({ textBuffer: Buffer.from(reader.result) });
    console.log(this.state.textBuffer);
    this.actualUpload();
  };

  //first, convert the report text to buffer, then send the combined update to blockchain.
  updateSubmit = async (event) => {


    console.log('Set report category to: ' + this.state.category);
    event.preventDefault();
    //convert the text report to buffer
    const file = new Blob([this.state.value], { type: 'text/plain' });

    console.log("Text input value: " + this.state.value);

    //obtain contract address from storehash.js
    const contractAddress = await storehash.options.address;
    console.log("ETH address is:" + contractAddress);
    this.setState({ contractAddress });

    // check if verified
    if (this.state.token_balance >= 10) {
      this.setState({ verified: true });
    }
    console.log("User is verified? " + this.state.verified);

    // read text input as buffer
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => this.convertTextToBuffer(reader);
  };

  //submit both image and text to ipfs network, save two returned hashes to states.
  actualUpload = async () => {

    //If there is no image, the buffer is ''
    if (this.state.imageBuffer !== '') {
      console.log(this.state.textBuffer);

      await ipfs.add(this.state.textBuffer, async (err, ipfsHash) => {
        console.log("error message:" + err);
        this.setState({ ipfsHash: ipfsHash[0].hash });

        await ipfs.add(this.state.imageBuffer, (err, imageHash) => {
          this.setState({ imageHash: imageHash[0].hash });
          const time = new Date().toLocaleString();

          if (this.state.verified) {
            storehash.methods.sendUpdate(this.state.ipfsHash, this.state.location,
              time, this.state.imageHash, this.state.category, this.state.tag, this.state.extension).send({
                from: this.state.walletAddress
              }, (error, transactionHash) => {
                this.setState({ transactionHash });
              }); //storehash

            this.getToken();
          }
        });
      })
    }
    else { //we only want to send the text
      console.log(this.state.textBuffer)
      await ipfs.add(this.state.textBuffer, async (err, ipfsHash) => {
        this.setState({ ipfsHash: ipfsHash[0].hash });
        const time = new Date().toLocaleString();
        if (this.state.verified) {
          //Trying to use '' as an image hash/place holder
          storehash.methods.sendUpdate(this.state.ipfsHash, this.state.location,
            time, '', this.state.category, this.state.tag,this.state.extension).send({
              from: this.state.walletAddress
            }, (error, transactionHash) => {
              this.setState({ transactionHash });
            }); //storehash
        }
      })
    }
  }

  getTransactionReceipt = async () => {
    try {
      this.setState({
        blockNumber: "waiting..",
        gasUsed: "waiting..."
      });

      //get Transaction Receipt in console on click
      //See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
        console.log(err, txReceipt);
        this.setState({ txReceipt });
      });

      //await for getTransactionReceipt
      await this.setState({ blockNumber: this.state.txReceipt.blockNumber });
      await this.setState({ gasUsed: this.state.txReceipt.gasUsed });
    }

    catch (error) {
      console.log(error);
    }

  }

/*   updateReadytime = async() => {
    const address = this.state.walletAddress;
    const isReady = await MemeToken.methods.isReady(address).call().then((result) => {
      console.log(result);
      return result;
    }).catch( error =>
      console.log(error)
    );
    this.setState({isReady: isReady});
  } */


  // for any user who has metamask, send the ERC-20 tokens to the account.
  getToken = async (tokens = 1) => {
    const address = this.state.walletAddress;
    const amount = BigInt(1000000000000000000 * tokens);
    //MemeToken.methods.
    MemeToken.methods.isReady(address).call().then((result)=>{
      console.log("is ready? "+result);
    });
    MemeToken.methods.getReadytime(address).call().then((result)=>{
      console.log("Ready time is "+result);
    });
    MemeToken.methods.buy(amount).send({
      from: this.state.walletAddress
    }, (error, tokenTransactionHash) => {
      console.log('token received successfully with the transaction hash: ' + tokenTransactionHash);
    });
    //this.updateReadytime();
  }

  // get the user reputation
  updateReputation = async () => {
    const address = this.state.walletAddress;
    const repu = await storehash.methods.getReputation(address).call().then((result) => {
      console.log(result);
      return result;
    }).catch(error =>
      console.log(error)
    );
    // console.log(this.state.reputation);
    this.setState({ reputation: repu });
    // console.log(this.state.reputation);
  }

  //To capture the reputation of the message poster
  returnReputation = async (userAddress) => {
    const address = userAddress;
    const repu = await storehash.methods.getReputation(address).call().then((result) => {
      //console.log("This is the repu " + result + (result > 0));
      return result
    });
    console.log(repu > 0)
    return repu > 0;
  }

  //Update balance and verified state right after getting the token balance
  getTokenBalance = async () => {
    const address = this.state.walletAddress;
    const balance = await MemeToken.methods.checkBalance().call(
      { from: this.state.walletAddress }).then((result) => {
        console.log("This is the current token balance " + result / 1000000000000000000);
        return result
      });;
    this.setState({ token_balance: balance / 1000000000000000000 });

    if (this.state.token_balance > 5) {
      this.setState({ verified: true });
    }
  }

  // report post (downvote)
  downvotePost = async (address, hash, id) => {
    if (this.state.votedPosts.some(el => el.id === id)){
      console.log("can't upvote twice")
      return;
    }
    console.log('call reportPost function');
    var temp = storehash.methods
        .downvote(this.state.walletAddress, address, hash, id).send({
      from: this.state.walletAddress
    });
    const authorized = await storehash.methods
    .checkVotePostAccess(this.state.walletAddress, hash).call().then((result) => {
      return result;
    });;

    if (authorized){
      this.updateNews();
      console.log("authorized to vote")
    } else {
      console.log("not authorized to vote")
    }
  }

  //upvote post
  upvotePost = async (address, hash, id) => {
    if (this.state.votedPosts.some(el => el.id === id)){
      console.log("can't downvote twice")
      return;
    }
    console.log('call upVote function');
    var temp = storehash.methods
        .upvote(this.state.walletAddress, address, hash, id).send({
      from: this.state.walletAddress
    });
    const authorized = await storehash.methods
    .checkVotePostAccess(this.state.walletAddress, hash).call().then((result) => {
      return result;
    });

    if (authorized){
      this.updateNews();
      let scaledTokens = 0.05;
      this.getToken(scaledTokens);
      console.log("authorized to vote")
    } else {
      console.log("not authorized to vote")
    }
  }

  //render news including html and css
  // get the user name
  updateUsername = async () => {
    const address = this.state.walletAddress;
    console.log('call updateUsername function');
    const name = await storehash.methods.getUsername(address).call().then((result) => {
      // console.log(result);
      return result;
    });
    console.log("before update name: " + this.state.username);
    this.setState({ username: web3.utils.hexToAscii(name) });
    console.log("after update name: " + name);
  }

  getUsername = async (address) => {

    var name = await storehash.methods.getUsername(address).call().then((result) => {
      console.log('fetched name: ' + result);
      return result;
    });
    if (name == 0x0000000000000000000000000000000000000000000000000000000000000000) {
      console.log("no name");
      // default userName is first 10 char of userAddress
      name = address.substring(0, 9);
    } else {
      name = web3.utils.hexToAscii(name);
    }
    this.setState({ username: name });
    return name;
  }

  updateBio = async () => {
    const address = this.state.walletAddress;
    console.log('call updateBio function');
    const bio = await storehash.methods.getBio(address).call().then((result) => {
      // console.log(result);
      return result;
    });
    console.log("before update bio: " + this.state.bio);
    this.setState({ bio: web3.utils.hexToAscii(bio) });
    console.log("after update bio: " + bio);
  }

  getBio = async (address) => {

    var bio = await storehash.methods.getBio(address).call().then((result) => {
      console.log('fetched bio: ' + result);
      return result;
    });
    if (bio == 0x0000000000000000000000000000000000000000000000000000000000000000) {
      console.log("no bio");
      // default userName is first 10 char of userAddress
      bio = "no bio";
    } else {
      bio = web3.utils.hexToAscii(bio);
    }
    this.setState({ bio: bio });
    return bio;
  }

  editProfile = async () => {
    const address = this.state.walletAddress;
    const name = this.state.nameField;
    console.log('call editProfile function');
    const bio = this.state.bioField;

    console.log("state: " + name + " field: " + this.state.username);
    console.log("state: " + bio + " field: " + this.state.bio);
    // change username/bio on chain only if textField is nonempty and not the same as username
    if (!(!name || 0 === name.length) && !(!bio || 0 === bio.length)) {
      console.log('Profile being processed; name: ' + name + ' bio: ' + bio);
      storehash.methods.setProfile(address, web3.utils.asciiToHex(bio), web3.utils.asciiToHex(name)).send({ from: this.state.walletAddress });
    } else if (!(!bio || 0 === bio.length)) {
      console.log('bio being processed: ' + bio);
      storehash.methods.setBio(address, web3.utils.asciiToHex(bio)).send({ from: this.state.walletAddress });
    } else if (!(!name || 0 === name.length)) {
      console.log('name being processed: ' + name);
      storehash.methods.setUsername(address, web3.utils.asciiToHex(name)).send({ from: this.state.walletAddress });
    }
    this.updateUsername();
    this.updateBio();
  }

  renderNews = (data) => {
    return data.slice(0).reverse().map((update, index) =>
      <ListGroup.Item key={index}>
        <Row>
          <Col xs={4} align="left" style={{ display: "flex", alignItems: "flex-start", textOverflow: "clip" }}>
            User: {update.username === '' ? update.user.substring(0, 9) : update.username} <br/>
            Location: {update.location}
          </Col>
          <Col>
            {update.imageHash != "" &&
              <img
                style={{filter: this.state.newsList[update.id].post_repu < 40 ? 'blur(8px)' : 'blur(0px)'}}
                className={update.category === "free" ? "preview-free" : "preview"}
                src={"https://gateway.ipfs.io/ipfs/" + update.imageHash}
                width={150}
                height={150}
              />
            }
          </Col>
          <Col >
            <ViewNews update={update} user={this.state.walletAddress} />
          </Col>
          <div style={{
            display: 'inline',
            marginLeft: "16px",
            marginRight: "16px",
            backgroundColor: "#8080807a",
            borderRadius: "5px",
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '60px',
            width: '30px',
            alignItems: 'center'
          }}
          >

            {this.state.votedPosts.some(el => el.id === update.id && el.vote === true)?(
              <UpOutlined style={{ fontSize: '20px', color : "forestgreen"}}
                onClick={() => console.log("can't upvote twice")}
              />
            ) : (
              <UpOutlined
                style={{ fontSize: '16px' }}
                onClick={() => this.upvotePost(update.user, update.fileHash, update.id)}
              />
            )}

            <Col xs={0.1} align="center" style={{ display: "flex", alignItems: "flex-start", textOverflow: "clip" }}>
              {this.state.newsList[update.id].post_repu}
            </Col>

            {this.state.votedPosts.some(el => el.id === update.id && el.vote === false)?(
              <DownOutlined style={{ fontSize: '20px', color : "crimson"}}
                onClick={() => console.log("can't downvote twice")}
              />
            ) : (
              <DownOutlined
                style={{ fontSize: '16px' }}
                onClick={() => this.downvotePost(update.user, update.fileHash, update.id)}
              />
            )}

          </div>
        </Row>

        <Row>
          <Col style={{ display: "flex" }}>{update.tag}</Col>
          <Col offset={6} style={{ textAlign: "right" }}>{update.timeStamp}</Col>
        </Row>
        {/* <Row>
      <Col>Category: {update.category}</Col>
    </Row> */}
      </ListGroup.Item>);
  }

  handleMessageBox(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        this.setState({
          messageBox: ""
        });
      }
    }
  render() {
    //newsList length
    const news_total = this.state.newsList.length;
    //free posts
    const free_posts = this.state.newsList.filter(e => e.category === 'free');
    //premium posts
    const premium_posts = this.state.newsList.filter(e => e.category === 'premium');
    // grabs query from serach bar
    const { search } = window.location;
    // const query = new URLSearchParams(search).get('s').toLowerCase();
    // for button searching: replace "this.state.searchField" with "query"
    const fresh_free_posts = this.state.newsList
      .filter(e =>
        (e.username.toLowerCase().includes(this.state.searchField.toLowerCase())
          || e.tag.toLowerCase().includes(this.state.searchField.toLowerCase())
          || e.location.toLowerCase().includes(this.state.searchField.toLowerCase())
        )
      && e.category === 'free'
      && e.tag.includes(this.state.tag_selected));

    const trending_free_posts = this.state.newsList
      .filter(e =>
        (e.username.toLowerCase().includes(this.state.searchField.toLowerCase())
          || e.tag.toLowerCase().includes(this.state.searchField.toLowerCase())
          || e.location.toLowerCase().includes(this.state.searchField.toLowerCase())
        )
      && e.category === 'free'
      && e.tag.includes(this.state.tag_selected))
      .sort(function (a, b) { return a.post_repu - b.post_repu });

    const filtered_premium_posts = this.state.newsList
      .filter(e =>
        (e.username.toLowerCase().includes(this.state.searchField.toLowerCase())
          || e.tag.toLowerCase().includes(this.state.searchField.toLowerCase())
          || e.location.toLowerCase().includes(this.state.searchField.toLowerCase())
        )
      && e.category === 'premium'
      && e.tag.includes(this.state.tag_selected))
      .sort(function (a, b) { return a.post_repu - b.post_repu });

    const cur_tag = this.state.tag_selected;
    const menu = this.menuItems;

    //render website
    return (
      <div className="App">
        <p className="App-header">Northwestern Meme Sharing Platform</p>
        <hr />
        <Row>
          <Col>
            <strong>Memes</strong>
            <hr />
            <Search
              searchQuery={this.state.searchField}
              setSearchQuery={this.onSearchBarInput}
            />
            <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
              <ScrollMenu
                data={menu}
                arrowLeft={ArrowLeft}
                arrowRight={ArrowRight}
                onSelect={key => {this.setState({
                      tag_selected: key.includes("All")? '' : key });
                      console.log(this.state.tag_selected)}}
              />
            </div>
            <hr />
            <Tabs defaultActiveKey="trending" id="tab">
              <Tab eventKey="trending" title="Trending">
                <div className="list-wrapper">
                  <p>{this.renderNews(trending_free_posts)}</p>
                </div>
              </Tab>
              <Tab eventKey="fresh" title="Fresh">
                <div className="list-wrapper">
                  <p>{this.renderNews(fresh_free_posts)}</p>
                </div>
              </Tab>
              <Tab eventKey="premium" title="Premium">
                <div className="list-wrapper">
                  <p>{this.renderNews(filtered_premium_posts)}</p>
                </div>
              </Tab>
            </Tabs>
          </Col>
          <Col>
            <Container>
              <strong>Post and Profile</strong>
              <hr />
              <Tabs defaultActiveKey="post" id="profile-post-tab">
                <Tab eventKey="post" title="Post">
                  <br />
                  <Row>
                    <Col span={8}>
                      <p> Metamask account: {this.state.walletAddress}</p>
                    </Col>
                  </Row>
                  <div className="button">
                    <Row>
                      <Col xs={3}>
                        <Button
                          bsStyle="primary"
                          title={this.state.isReady ? "Click to receive the specified amount of tokens" : "You cannot obtain tokens at this time!"}
                          disabled={this.state.isReady ? false : true}
                          style={{ width: "130px"}}
                          type="submit"
                          onClick={() => this.getToken(this.state.tokensRequested)}>
                          Get Tokens
                        </Button>
                      </Col>
                      <Col xs={8}>
                        <Form.Control
                          type="number"
                          placeholder="Number of Tokens"
                          onChange={e => { this.setState({ tokensRequested: e.target.value }); }}>
                        </Form.Control>
                      </Col>
                    </Row>
                  </div>
                  <hr />
                  <Form onSubmit={this.updateSubmit}>
                    <Row>
                      <Col xs={3}>Content</Col>
                      <Col xs={8}><textarea className="textInputBox" onChange={e => { this.setState({ value: e.target.value }); }} /></Col>
                    </Row>

                    <Row>
                      <Col xs={3}>Location</Col>
                      <Col xs={8}><textarea className="locationInputBox" onChange={e => { this.setState({ location: e.target.value }); }} /></Col>
                    </Row>

                    <Row>
                      <Col xs={{ span: 10, offset: 1 }} style={{ display: "flex" }}>
                        <Picky
                          id="category picker"
                          options={["free", "premium"]}
                          value={this.state.category}
                          onChange={e => this.setState({ category: e })}
                          open={false}
                          multiple={false}
                          placeholder={"Select a Category"}
                          includeSelectAll={false}
                          keepOpen={false}
                          includeFilter={false}
                          dropdownHeight={200}
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={{ span: 10, offset: 1 }} style={{ display: "flex" }}>
                        <Picky
                          id="tag picker"
                          options={["NU 🟣", "Funny 😂", "WTF 🤨", "Awesome 😎", "Wholesome ❤️"]}
                          value={this.state.tag}
                          onChange={e => this.setState({ tag: e })}
                          open={false}
                          multiple={false}
                          placeholder={"Select a tag"}
                          includeSelectAll={false}
                          keepOpen={false}
                          includeFilter={true}
                          dropdownHeight={200}
                        />
                        </Col>
                    </Row>

                    <br />

                    <Row>
                      <Col xs={9}>
                        <input className="input" type="file" onChange={this.captureFile} />
                      </Col>
                      <Col xs={3}>
                        <div className="button">
                          {(this.state.value.length === 0 || this.state.category.includes("S")
                            || this.state.tag.length === 0 || this.state.location.length === 0) ? (
                              <Button bsStyle="primary" style={{ width: "130px" }} type="submit" disabled> Submit
                              </Button>
                            ) : (
                              <Button bsStyle="primary" style={{ width: "130px" }} type="submit" > Submit
                              </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Form>
                  <hr />

                  <Button onClick={this.getTransactionReceipt}> Get Transaction Receipt </Button>
                  <hr />
                  <Receipt ipfsHash={this.state.ipfsHash} imageHash={this.state.imageHash}
                    contractAddress={this.state.contractAddress} transactionHash={this.state.transactionHash}
                    blockNumber={this.state.blockNumber} gasUsed={this.state.gasUsed} />
                </Tab>
                <Tab eventKey="profile" title="Profile">
                  <br />
                  <Row>
                    <Col xs={3} align="left">
                      <p> Address: </p>
                      <p> Username: </p>
                      <p> Reputation:  </p>
                      <p> NUMT Balance: </p>
                      <p> Bio: </p>
                    </Col>
                    <Col xs={8} align="left">
                      <p> {this.state.walletAddress}</p>
                      <p> {this.state.username} </p>
                      <p> {this.state.reputation} </p>
                      <p> {this.state.token_balance} </p>
                      <p> {this.state.bio} </p>
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col xs={3}>
                      New Username:
                      </Col>
                    <Col xs={8}>
                      <textarea className="nameInputBox"
                        maxlength="32"
                        rows="1" cols="50"
                        onKeyPress={(e) => { this.handleMessageBox(e) }}
                        onChange={e => { this.setState({ nameField: e.target.value }); }} />
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col xs={3}>
                      New Bio:
                      </Col>
                    <Col xs={8}>
                      <textarea className="bioInputBox"
                        rows="1" cols="50"
                        maxlength="32"
                        onKeyPress={(e) => { this.handleMessageBox(e) }}
                        onChange={e => { this.setState({ bioField: e.target.value }); }} />
                    </Col>
                  </Row>
                  <hr />
                  <div className="button">
                    <Button bsStyle="primary" style={{ width: "130px" }} type="submit" onClick={this.editProfile}> Set Profile</Button>
                  </div>
                </Tab>
              </Tabs>
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
