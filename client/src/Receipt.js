//When you use token to pay, generate the receipt
import React, { useState, useEffect } from "react";
import { Table} from "react-bootstrap";
import './App.css';
import './Receipt.css';


export default function ViewNews(props) {
    return (
        <div class="wrapper">
        <Table bordered class="fixed">
            <thead>
                <tr>
                <th>Transaction Receipt Category</th>
                <th>Values</th>
                </tr>
            </thead>
            
            <tbody>
                <tr>
                <td class="left">IPFS Hash of Description</td>
                <td>{props.ipfsHash}</td>
                </tr>
                <tr>
                <td class="left"> IPFS Hash of Meme</td>
                <td>{props.imageHash}</td>
                </tr>
                <tr>
                <td class="left">Ethereum Contract Address</td>
                <td>{props.contractAddress}</td>
                </tr>
                <tr>
                <td class="left">Tx Hash # </td>
                <td>{props.transactionHash}</td>
                </tr>
                <tr>
                <td class="left">Block Number # </td>
                <td>{props.blockNumber}</td>
                </tr>
                <tr>
                <td class="left">Gas Used</td>
                <td>{props.gasUsed}</td>
                </tr>
            
            </tbody>
        </Table>
        </div>
    )

}