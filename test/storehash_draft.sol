// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

contract StoreHash {

    struct newsUpdate {
        address user;
        string timeStamp;
        string location;
        string fileHash;
        string imageHash;
        string category;
    }

    newsUpdate[] public newsList;
    mapping(address => uint) public userReputation;
    mapping(string => int) public postReputation;
    mapping(string => mapping(address => bool)) public postToAccess;

    event storageUpdate(string newValue, address updatedBy);
    
    function sendUpdate(string memory ipfsHash,string memory location, string memory time, string memory imageHash,string memory category) public {
        newsList.push(newsUpdate({
            user:msg.sender,
            timeStamp:time,
            location:location,
            fileHash: ipfsHash,
            imageHash: imageHash,
            category: category
        }));
        //initialize the post vote to zero
        postReputation[ipfsHash] = 0;
        if (userReputation[msg.sender] != 0x0){
             userReputation[msg.sender]+=10;
        }else{
            userReputation[msg.sender]=10;
        }
    }

    function getUpdate() public view returns (newsUpdate[] memory) {
        return newsList;
    }

    function getReputation(address account) public view returns (uint){
        return userReputation[account];
    }
    
    function increaseReputation(address account, uint amount) public  {
        userReputation[account] +=amount;
    }
    
    function decreaseReputation(address account, uint amount) public  {
        require(userReputation[account]>amount);
        userReputation[account] -=amount;
    }

    function increaseVote(string memory ipfsHash) public {
        postReputation[ipfsHash]+=1;
    }

    function decreaseVote(string memory ipfsHash) public {
        postReputation[ipfsHash]-=1;
    }

    function getVote(string memory ipfsHash) public view returns (int){
        return postReputation[ipfsHash];
    }
    // to grant access to user to a specfic post

    function grantAccess(string memory ipfsHash, address account) public{
        postToAccess[ipfsHash][account] =true;
    }

    function checkAccess(string memory ipfsHash, address account) public view returns (bool){
        if (postToAccess[ipfsHash][account] == true){
            return true;
        }
        return false;
    }

    
}

