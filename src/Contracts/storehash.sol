pragma experimental ABIEncoderV2;

contract Contract {
    string[] ipfsHash;

    event storageUpdate(string newValue, address updatedBy);
    
    function sendHash(string memory hash) public {
        ipfsHash.push(hash);
        emit storageUpdate(hash, msg.sender);
    }

    function getHash() public view returns (string[] memory) {
        return ipfsHash;
    }
}

