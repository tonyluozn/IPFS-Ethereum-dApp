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
    
}

