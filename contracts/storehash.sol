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
        uint user_repu;
    }

    struct votedPost {
      uint id;
      bool vote;
    }

    newsUpdate[] public newsList;
    mapping(address => uint) public userReputation;
    mapping(string => mapping(address => bool)) public postToAccess;

    mapping(address => votedPost[]) public votedPostId;

    mapping(address => bytes32) public userProfile;
    mapping(address => bytes32) public userBio;
    // account => ipfshas => up/downvote => true/false
    mapping(address => mapping(string => mapping(bool => bool))) public userVotedPosts;
    /* mapping(address=> mapping(string => bool)) public userSavedPosts; */

    event storageUpdate(string newValue, address updatedBy);

    function sendUpdate(string memory ipfsHash, string memory location, string memory time,
      string memory imageHash, string memory category, string memory tag, string memory extension) public {

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
            id: newsList.length,
            tag: tag,
            user_repu: userReputation[msg.sender]
        }));
        postToAccess[ipfsHash][msg.sender] =true;
        if (userReputation[msg.sender] != 0x0){
            userReputation[msg.sender]+=10;
        }else{
            userReputation[msg.sender]=10;
        }
    }

    // check if they are first-time users
    function checkFirstTimeUser(address account) public view returns (bool) {
        if (userReputation[account] != 0x0){
            return false;
        } else {
            return true;
        }
    }

    /* function addSavedPosts(string memory ipfsHash) public {
        if (userSavedPosts[ipfsHash].length == 0){
            userSavedPosts[ipfsHash] = string[];
        } else{
            userSavedPosts[ipfsHash].push(ipfsHash);
        }
    } */

    function getUpdate() public view returns (newsUpdate[] memory) {
        return newsList;
    }

    function getVotedPosts(address account) public view returns (votedPost[] memory) {
        return votedPostId[account];
    }

    function getReputation(address account) public view returns (uint){
        return userReputation[account];
    }

    function addVotedPosts(address account, string memory ipfsHash, bool vote) public{
        userVotedPosts[account][ipfsHash][vote] = true;
    }

    function getVote(address account, string memory ipfsHash) public view returns (uint){
        if (userVotedPosts[account][ipfsHash][true]){
            return 1;
        }
        if (userVotedPosts[account][ipfsHash][false]){
            return 2;
        }
        return 0;
    }

    function checkVotePostAccess(address account, string memory ipfsHash) public view returns (bool){
        return !userVotedPosts[account][ipfsHash][true]
            && !userVotedPosts[account][ipfsHash][false];
    }

    function increaseReputation(address account, uint amount) public  {
        userReputation[account] +=amount;
        //
    }

    function decreaseReputation(address account, uint amount) public  {
        require(userReputation[account]>amount);
        userReputation[account] -=amount;
    }

    function increaseVote(uint id) public {
        newsList[id].post_repu += 1;
    }

    function decreaseVote(uint id) public {
        newsList[id].post_repu -= 1;
    }

    function upvote(address wallet, address account,
      string memory ipfsHash, uint id) public returns (uint){
        if (this.checkVotePostAccess(wallet, ipfsHash)){
            this.increaseReputation(account, 1);
            this.increaseVote(id);
            this.addVotedPosts(wallet, ipfsHash, true);
            votedPost memory v = votedPost(id, true);
            votedPostId[wallet].push(v);
            return 0;
        }
        return 1;
    }

    function downvote(address wallet,
      address account, string memory ipfsHash, uint id) public returns (uint) {
        if (this.checkVotePostAccess(wallet, ipfsHash)){
            this.decreaseReputation(account, 1);
            this.decreaseVote(id);
            this.addVotedPosts(wallet, ipfsHash, true);
            votedPost memory v = votedPost(id, false);
            votedPostId[wallet].push(v);
            return 0;
        }
        return 1;
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
