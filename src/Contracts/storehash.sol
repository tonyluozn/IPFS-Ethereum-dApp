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
    }

    newsUpdate[] public newsList;
    mapping(address => uint) public userReputation;

    event storageUpdate(string newValue, address updatedBy);
    
    function sendUpdate(string memory ipfsHash,string memory location, string memory time) public {
        newsList.push(newsUpdate({
            user:msg.sender;
            timeStamp:time;
            location:location;
            ipfsHash: ipfsHash;
        }));
        
        userReputation[msg.sender]+=10;
        emit storageUpdate(ipfsHash, msg.sender);
    }

    function getUpdate() public view returns (newsUpdate[] memory) {
        return newsList;
    }

    function getReputation(address account) public view returns (uint){
        return userReputation[account];
    }
    
    function increaseReputation(address account, uint amount) public view {
        userReputation[account] +=amount;
    }
    
    function decreaseReputation(address account, uint amount) public view {
        require(userReputation[account]>amount);
        userReputation[account] -=amount;
    }
    
}