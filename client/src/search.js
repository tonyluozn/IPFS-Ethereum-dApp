import React, { useState, useEffect } from "react";
import { Modal, Button, Col, Row, ListGroup, Container, InputGroup, FormControl} from "react-bootstrap";
import storehash from './storehash';
import './search.css';

const SearchBar = ({ searchQuery, setSearchQuery }) => (
    <form action="/" method="get">
      <Row>
        <Col xs={3}>
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
        <Col xs={3}>

        </Col>
      </Row>
      <hr />
    </form>
);

export default SearchBar;
