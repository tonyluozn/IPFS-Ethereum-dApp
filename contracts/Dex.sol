// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface IERC20 {

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);


    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}


contract ERC20Basic is IERC20 {

    string public constant name = "NUMemeToken";
    string public constant symbol = "NUMT";
    uint8 public constant decimals = 18;
    uint public constant tokenCooldown = 1 days;


    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    //keeps track of when users can next request a token
    mapping(address => uint256) readyTime; 
    //keeps track of how many tokens the user has requested in the last 24 hour period
    mapping(address => uint256) tokensRequested;
    uint8 tokenRequestLimit = 2;

    uint256 totalSupply_ = 10000 ether;

    using SafeMath for uint256;

    constructor() {
        balances[msg.sender] = totalSupply_;
        readyTime[msg.sender] = block.timestamp;
    }

    function totalSupply() public override view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function getReadytime(address account) public view returns (uint256){
        return readyTime[account];
    }

    function _triggerCooldown(address account) internal {
        readyTime[account] = uint32(block.timestamp + tokenCooldown);
    }

    function isReady(address account) public view returns (bool) {
        return (readyTime[account] <= block.timestamp);
    }
    
    //helper functions for transfer
    function resetTokenRequest(address receiver) internal {
        if(getReadytime(receiver) < (block.timestamp - 1 days)) {
            tokensRequested[receiver] = 0;
        }
    }
    
    function manageLimitBreach(address receiver, uint256 numTokens) internal {
        if ((tokensRequested[receiver] + numTokens) >= tokenRequestLimit) {
            numTokens = tokenRequestLimit - tokensRequested[receiver];
            tokensRequested[receiver] = 0;
            _triggerCooldown(receiver);
        } else {
            tokensRequested[receiver] += numTokens;
        }
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        resetTokenRequest(receiver);
        manageLimitBreach(receiver, numTokens);
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(numTokens);
        balances[receiver] = balances[receiver].add(numTokens);
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner].sub(numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        emit Transfer(owner, buyer, numTokens);
        return true;
    }
}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }
}

contract Dex {

    event GetToken(uint256 amount);
    event SendBack(uint256 amount);


    ERC20Basic public token;

    constructor() {
        token = new ERC20Basic();
    }


    function checkBalance() public view returns (uint256){
        return token.balanceOf(msg.sender);
    }

    function buy(uint256 amount) payable public {
        uint256 dexBalance = token.balanceOf(address(this));
        require(amount <= dexBalance, "Not enough tokens in the reserve");
        require(token.isReady(msg.sender), "Can't request tokens now!");
        token.transfer(msg.sender, amount);
        emit GetToken(amount);
    }
    
    // Access the transfer function in Dex contract
    function transfer(address receiver, uint256 amount) public {
        token.transferFrom(msg.sender,receiver,amount);
    }

    function sell(uint256 amount) public {
        require(amount > 0, "You need to give back at least some tokens");
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Check the token allowance");
        token.transferFrom(msg.sender, address(this), amount);
        //msg.sender.transfer(amount);
        emit SendBack(amount);   
    }

}