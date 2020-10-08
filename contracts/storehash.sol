// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

contract Contract {

    struct newsUpdate {
        address user;
        string timeStamp;
        string location;
        string fileHash;
        string imageHash;
        string category;
        uint votes;
    }

    newsUpdate[] public newsList;
    mapping(address => uint) public userReputation;

    event storageUpdate(string newValue, address updatedBy);
    
    function sendUpdate(string memory ipfsHash,string memory location, string memory time, string memory imageHash,string memory category, uint memory vote) public {
        newsList.push(newsUpdate({
            user:msg.sender,
            timeStamp:time,
            location:location,
            fileHash: ipfsHash,
            imageHash: imageHash,
            category: category,
            vote:vote
        }));
        if (userReputation[msg.sender] != 0x0){
             userReputation[msg.sender]+=10;
        }else{
            userReputation[msg.sender]=10;
        }
       
        emit storageUpdate(ipfsHash, msg.sender);
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
    
}

