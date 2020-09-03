// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

contract Contract {

    struct newsUpdate {
        address user;
        string timeStamp;
        string location;
        string ipfsHash;
    }

    newsUpdate[] public newsList;
    mapping(address => uint) public userReputation;

    event storageUpdate(string newValue, address updatedBy);
    
    function sendHash(string memory ipfsHash,string memory location, string memory time) public {
        newsList.push();
        userReputation[msg.sender]+=10;
        emit storageUpdate(ipfsHash, msg.sender);
    }

    function getHash() public view returns (newsUpdate[] memory) {
        return newsList;
    }

    function getReputation(address account) public view returns (uint){
        return userReputation[account];
    }
}

