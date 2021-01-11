import React, { useState, useEffect } from "react";
import { Modal, Button, Col, Row, ListGroup, Container, InputGroup, FormControl} from "react-bootstrap";
import storehash from './storehash';


export default function ViewNews(props) {
  
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [content, setContent] = useState(null);
    // boolean indicating if the repu of the post author is too low.
    const [lowRepu, setLowRepu] = useState(false);
    const [reputation,setReputation] = useState(0);

    useEffect(() => {onLoad()}, []);
    // first convert the fileHash to the string and save to the state
    async function onLoad() {
        await fetch("https://gateway.ipfs.io/ipfs/"+props.hash.fileHash).then(response => response.text())
        .then(data => {
            setContent(data);
            console.log("text loaded: "+data);
        }
        ) 
        const address = props.user;
        await storehash.methods.getReputation(address).call().then((result) => {
          //console.log("This is the repu " + result + (result > 0));
          setLowRepu(result<40);
          setReputation(result);
        });
    }

    //place holder for the props.
    function validImage(props){
        //return <img src={"https://gateway.ipfs.io/ipfs/"+props.hash.imageHash} width="300" height="300"/>
        if(props.hash.imageHash !== ''){
          return ["https://gateway.ipfs.io/ipfs/"+props.hash.imageHash, "300","300"]
        }else{
          return ['',"0","0"]
        }
    }

    // assuming the file is either text file or an image. Conditional rendering added 
    return (
        <>
          <Button block variant="outline-primary" onClick={handleShow}>
            {"View"}
          </Button>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>News - Reputation: {reputation}</Modal.Title>
            </Modal.Header>
              <Modal.Body>
                {lowRepu? 
                  <p>This post was uploaded by someone with low reputation, do you want to proceed?</p>
                  :
                  <p>
                    {props.canView? 
                      <Col>
                      <Row><p>{content}</p></Row>
                    <img src={validImage(props)[0]} width= {validImage(props)[1]} height={validImage(props)[2]}/> 
                    <Row><Col><a target="_blank" href={"https://gateway.ipfs.io/ipfs/"+props.hash.fileHash}>File Link</a></Col>
                    {props.image? <Col><a target="_blank" href={"https://gateway.ipfs.io/ipfs/"+props.hash.imageHash}>Image Link</a></Col>:<p/>}
                      </Row>
                      </Col>
                    :<p>you don't have enough tokens to view this news</p>}
                  </p> 
                }
              </Modal.Body>
            <Modal.Footer>
              {lowRepu?   
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
                <Button variant="outline-secondary" onClick={handleClose}>
                  Close
                </Button>
              }
            </Modal.Footer>
          </Modal>
        </>
      );
}