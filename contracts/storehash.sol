// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;
pragma solidity ^0.7.0;

contract StoreHash {

    struct newsUpdate {
        address user;
        string username;
        string bio;
        string timeStamp;
        string location;
        string fileHash;
        string imageHash;
        string category;
        string extension;
        int post_repu;
        uint id;
        string tag;
    }

    newsUpdate[] public newsList;
    mapping(address => uint) public userReputation;
    mapping(string => int) public postReputation;
    mapping(string => mapping(address => bool)) public postToAccess;

    mapping(address => bytes32) public userProfile;
    mapping(address => bytes32) public userBio;  // maps user address to a profile (username)

    event storageUpdate(string newValue, address updatedBy);

    function sendUpdate(string memory ipfsHash,string memory location, string memory time, string memory imageHash,string memory category, string memory extension, string memory tag) public {
        newsList.push(newsUpdate({
            user:msg.sender,
            username: this.bytes32ToString(userProfile[msg.sender]),
            bio: this.bytes32ToString(userBio[msg.sender]),
            timeStamp:time,
            location:location,
            fileHash: ipfsHash,
            imageHash: imageHash,
            category: category,
            extension: extension,
            post_repu: 0,
            id: newsList.length - 1,
            tag: tag
        }));
        //initialize the post vote to zero
        postReputation[ipfsHash] = 0;
        postToAccess[ipfsHash][msg.sender] =true;
        if (userReputation[msg.sender] != 0x0){
            // give them tokens if they are first time users.

            //
            userReputation[msg.sender]+=10;
        }else{
            userReputation[msg.sender]=10;
        }
    }

    // check if they are first-time users



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

    function increaseVote(string memory ipfsHash, uint id) public {
        newsList[id].post_repu += 1;
        postReputation[ipfsHash]+=1;
    }

    function decreaseVote(string memory ipfsHash, uint id) public {
        newsList[id].post_repu -= 1;
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
        return false;    }

    function getUsername(address account) public view returns (bytes32){
        return userProfile[account];
    }

    function setUsername(address account, bytes32 newName) public{
        userProfile[account] = newName;
    }

    function getBio(address account) public view returns (bytes32){
        return userBio[account];
    }

    function setBio(address account, bytes32 newBio) public{
        userBio[account] = newBio;
    }

    function setProfile(address account, bytes32 newBio, bytes32 newName) public{
        userBio[account] = newBio;
        userProfile[account] = newName;
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

}
