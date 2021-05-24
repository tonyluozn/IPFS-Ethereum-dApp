import React, { useState, useEffect } from "react";
import './ViewNews.css';
import { Modal, Button, Col, Row, Image, ListGroup, Container, InputGroup, FormControl, ButtonGroup, Popover, OverlayTrigger } from "react-bootstrap";
import storehash from './storehash';
import ReactAudioPlayer from 'react-audio-player';
import MemeToken from "./MemeToken";
/* global BigInt */


export default function ViewNews(props) {

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [content, setContent] = useState(null);
  // boolean indicating if the repu of the post author is too low.
  const [lowRepu, setLowRepu] = useState(false);
  // set user reputation
  const [reputation, setReputation] = useState(0);
  //if meet the requirement, show the content
  const [canView, setCanView] = useState(false);
  const [media, setMedia] = useState(null);
  useEffect(() => { onLoad() }, [props.isLoggedIn]);

  async function onLoad() {
    // if the post is free, then user can view; if it's premium, then check if the user has paid or not
    //
    if (props.update.category == "free") {
      setCanView(true);
    } else {
      if (props.isLoggedIn) {
        await storehash.methods.checkAccess(props.update.fileHash, props.user).call()
          .then((result) => {
            setCanView(result);

            console.log('user ' + props.user + ' has already paid for this post. ' + result)
          });

      }
    }

    await fetch("https://gateway.ipfs.io/ipfs/" + props.update.fileHash).then(response => response.text())
      .then(data => {
        setContent(data + "." + props.update.extension);
        console.log(data)
        if (props.update.extension == 'mp3') {
          console.log("this is mp3")
          setMedia(
            <ReactAudioPlayer
              src={"https://gateway.ipfs.io/ipfs/" + props.update.imageHash}
              autoPlay
              controls
            />);
        } else if (props.update.extension == 'jpg' || props.update.extension == 'jpeg' || props.update.extension == 'png') {
          console.log("this is jpg")
          setMedia(<img
            src={validImage(props)[0]}
            width={validImage(props)[1]}
            height={validImage(props)[2]}
          />)
        } else if (props.update.extension == 'pdf') {
          console.log("This is pdf")
          setMedia(
            <embed class="resume-frame" src={"https://gateway.ipfs.io/ipfs/" + props.update.imageHash} />
          )
        } else if (props.update.extension == 'mp4') {
          setMedia(
            <video
              id="my-video"
              class="video-js"
              controls
              preload="auto"
              width="360"
              height="264"
              data-setup="{}"
            >
              <source src={"https://gateway.ipfs.io/ipfs/" + props.update.imageHash} type="video/mp4" />
              <p class="vjs-no-js">
                To view this video please enable JavaScript, and consider upgrading to a
                web browser that
                <a href="https://videojs.com/html5-video-support/" target="_blank"
                >supports HTML5 video</a>
              </p>
            </video>)
        }
        console.log("text loaded: " + data);
      }
      )
    const address = props.update.user;
    await storehash.methods.getReputation(address).call().then((result) => {
      //console.log("This is the repu " + result + (result > 0));
      setLowRepu(result < 40);
      setReputation(result);
    });
  }

  //place holder for the props.
  function validImage(props) {
    //return <img src={"https://gateway.ipfs.io/ipfs/"+props.hash.imageHash} width="300" height="300"/>
    if (props.update.imageHash !== '') {
      return ["https://gateway.ipfs.io/ipfs/" + props.update.imageHash, "300", "300"]
    } else {
      return ['', "0", "0"]
    }
  }

  // the current user pay 0.1 NUHT to the author of the post
  const handlePayment = async () => {
    const amount = BigInt(100000000000000000);
    await MemeToken.methods.transfer(props.update.user, amount).send({
      from: props.user
    }, (error, tokenTransactionHash) => {
      //once the transaction is successful, update the view and give the access
      console.log('token transaction successfull with the tansaction hash: ' + tokenTransactionHash);
      if (tokenTransactionHash) {
        setCanView(true);
        storehash.methods.grantAccess(props.update.fileHash, props.user).send({ from: props.user });
      }
    });
  };
  const copyPrompt = (
    <Popover id="popover-basic">
      <Popover.Title as="h3">Successfully Copied!</Popover.Title>
      <Popover.Content>
        Feel free to use this in discord (or wherever you want)!
        </Popover.Content>
    </Popover>
  );

  const handleSave = async () => {
    //const address = props.update.user;
    //await storehash.methods.addSavedPosts(address).call();
    console.log("Temporary message");
  }

  const [isHovered, setHover] = useState(false);



  // assuming the file is either text file or an image. Conditional rendering added
  return (
    <>
      {(lowRepu) ? (
        <Button block variant="outline-danger" onClick={handleShow}>
          {"View"}
        </Button>
      ) : (
          <Button block variant="outline-primary" onClick={handleShow}>
            {"View"}
          </Button>
        )}

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{props.update.tag} - Reputation: {reputation}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {lowRepu ?
            <p>This post was uploaded by someone with low reputation, do you want to proceed?</p>
            :
              <div>{canView ?
                <Col>
                  <Row><Col><p>{content}</p></Col></Row>
                  
                  <div className="img-container" onMouseOver={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
                    {media}
                    {isHovered && 
                      <Button className="save" variant="primary" size="lg" onClick= {() => this.handleSave()}>Save</Button>
                    } 
                    {isHovered && (
                      <ButtonGroup className="file-links" size="lg">
                        <Button className="file-link" variant="primary" target="_blank" href={"https://gateway.ipfs.io/ipfs/" + props.update.fileHash}>File Link</Button>
                        <OverlayTrigger trigger="focus" placement="top" overlay={copyPrompt}>
                          <Button className="file-copy" variant="primary" onClick={() => { navigator.clipboard.writeText("Sending this funny meme via NU Meme Platform(https://nu-meme-sharing-dapp.web.app/): https://gateway.ipfs.io/ipfs/" + props.update.fileHash) }}>Copy</Button>
                        </OverlayTrigger>
                      </ButtonGroup>
                    )}
                    {isHovered && props.update.imageHash && (
                      <ButtonGroup className="img-links" size="lg">
                        <Button className="img-link" variant="primary" target="_blank" href={"https://gateway.ipfs.io/ipfs/" + props.update.imageHash}>Image Link</Button>
                        <OverlayTrigger trigger="focus" placement="top" overlay={copyPrompt}>
                          <Button className="img-copy" variant="primary" onClick={() => { navigator.clipboard.writeText("Sending this funny meme via NU Meme Platform(https://nu-meme-sharing-dapp.web.app/): https://gateway.ipfs.io/ipfs/" + props.update.imageHash) }}>Copy</Button>
                        </OverlayTrigger>
                      </ButtonGroup>
                    )} 
                  </div>
                  <hr />
                  <p>
                    Posted by {props.update.username} <br />
                    @ {props.update.user} <br />
                    bio: {props.update.bio} <br />
                  </p>
                </Col>
                :
                <p>You need to pay NUMT to access this post.</p>
              }
</div>
          }
        </Modal.Body>
        <Modal.Footer>
          {lowRepu ?
            <Row>
              <Col>
                <Button variant="outline-secondary" onClick={() => setLowRepu(false)}>
                  View
                    </Button>
              </Col>
              <Col>
                <Button variant="outline-secondary" onClick={handleClose}>
                  Close
                    </Button>
              </Col>
            </Row>
            :
            <p>
              {canView ?
                <Button variant="outline-secondary" onClick={handleClose}>
                  Close
                    </Button>
                :
                <Row>
                  <Col>
                    <Button variant="outline-secondary" onClick={handlePayment}>
                      Pay
                      </Button>
                  </Col>
                  <Col>
                    <Button variant="outline-secondary" onClick={handleClose}>
                      Close
                      </Button>
                  </Col>
                </Row>
              }
            </p>
          }
        </Modal.Footer>
      </Modal>
    </>
  );
}
