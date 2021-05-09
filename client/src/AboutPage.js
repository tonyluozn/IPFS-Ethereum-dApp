import React, { useState, useEffect } from "react";
import stylesheet from './AboutPage.module.css';
import { Modal, Button} from "react-bootstrap";


export default function AboutPage() {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // assuming the file is either text file or an image. Conditional rendering added
    return (
        <>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",height:"70px",justifyContent:"center"}}>
                <button class={stylesheet.button} onClick={handleShow}>
                {"About"}
                </button>
            </div>
            

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>About</Modal.Title>
            </Modal.Header>
              <Modal.Body>
                <p>This is a meme sharing web app for northwestern students developed by NU Blockchain Group technical project team. Unlike typical applications, this web app runs on a blockchain network in a public, open source and decentralized environment. All the content uploaded by our users are stored in a decentralized way using IPFS and Ethereum Blockchain. </p>
                <p>1. Install chrome extension of <a href="https://levelup.gitconnected.com/how-to-use-metamask-a-step-by-step-guide-f380a3943fb1" target="_blank"  >Metamask</a> and set up an account.</p>
                <p>2. Connect Metamask to the site and choose “Rinkeby” network. Once connected, you are able to see the memes!</p>
                <p>3. To upload memes and interact with the app (upvote a meme, set your profile, etc), you will need to get some free test ETHs for your account. This is because those actions are transactions on blockchain so it will charges gas fee. Please go to <a href="https://faucet.rinkeby.io/" target="_blank">this site</a> and follow the instructions to get some free ETHs.</p>
                <p>4. We are also issuing native tokens NUMT in our platform. You will be able to obtain 2 tokens at maximum per day. They could be used in the app for viewing posts under premium category. </p>
              </Modal.Body>
          </Modal>
        </>
      );
}
