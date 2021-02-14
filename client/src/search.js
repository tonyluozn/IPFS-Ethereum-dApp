import React, { useState, useEffect } from "react";
import { Modal, Button, Col, Row, ListGroup, Container, InputGroup, FormControl} from "react-bootstrap";
import storehash from './storehash';

const SearchBar = ({ searchQuery, setSearchQuery }) => (
    <form action="/" method="get">
      <Row>
        <Col xs={2}>
            <label htmlFor="header-search">
                <span className="visually-hidden">Search posts</span>
            </label>
        </Col>
        <Col xs={6}>
            <textarea
                className="searchInputBox"
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search posts"
                name="s"
                rows="1" cols="40"
            />
        </Col>
        <Col xs={2}>
          <Button
            variant="primary"
            style={{height:"35px"}}
            type="submit">Search</Button>
        </Col>
      </Row>
      <hr />
    </form>
);

export default SearchBar;
