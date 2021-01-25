//When you use token to pay, generate the receipt
import React, { useState, useEffect } from "react";
import { Table} from "react-bootstrap";
import './App.css';


export default function ViewNews(props) {
    return (
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
                <td>{props.ipfsHash}</td>
                </tr>
                <tr>
                <td>IPFS Hash of image stored on Eth Contract</td>
                <td>{props.imageHash}</td>
                </tr>
                <tr>
                <td>Ethereum Contract Address</td>
                <td>{props.contractAddress}</td>
                </tr>
                <tr>
                <td>Tx Hash # </td>
                <td>{props.transactionHash}</td>
                </tr>
                <tr>
                <td>Block Number # </td>
                <td>{props.blockNumber}</td>
                </tr>
                <tr>
                <td>Gas Used</td>
                <td>{props.gasUsed}</td>
                </tr>
            
            </tbody>
        </Table>
    )

}