import React, { useState, useEffect } from "react";
import { Modal, Button, Col, Row, ListGroup, Container, InputGroup, FormControl} from "react-bootstrap";


export default function ViewNews(props) {
  
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [content, setContent] = useState(null);

    useEffect(() => {onLoad()}, []);
    // for future uses of converting api endpoint to the text 
    async function onLoad() {

        await fetch("https://gateway.ipfs.io/ipfs/"+props.hash).then(response => response.text())
        .then(data => {
            setContent(data);
            console.log("text loaded: "+data);
        }
        )
    }

    // assuming the file is either text file or an image. Conditional rendering added 
    return (
        <>
          <Button block variant="outline-primary" onClick={handleShow}>
            {"View"}
          </Button>

          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>News</Modal.Title>
            </Modal.Header>
              <Modal.Body>
                  
                  {props.view? 
                    <Col>
                    <Row><p>{content}</p></Row>
                    {content?null:
                  <img src={"https://gateway.ipfs.io/ipfs/"+props.hash} width="300" height="300"/> 
                  }
                    <Row><a href={"https://gateway.ipfs.io/ipfs/"+props.hash}>File Link</a></Row>
                    </Col>
                :<p>you don't have enough tokens to view this news</p>}
                  
              
              </Modal.Body>
            <Modal.Footer>
              <Button variant="outline-secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      );
}