// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Faucet is Ownable {
    mapping(address => uint256) public lastClaim;
    uint256 public claimAmount = 100 * 10**18; // 100 tokens
    uint256 public claimCooldown = 1 days;

    mapping(address => bool) public allowedTokens;
    address[] public tokens;

    constructor() Ownable(msg.sender) {}

    function addToken(address token) external onlyOwner {
        allowedTokens[token] = true;
        tokens.push(token);
    }

    function claim(address token) external {
        require(allowedTokens[token], "Token not allowed");
        require(block.timestamp >= lastClaim[msg.sender] + claimCooldown, "Cooldown not passed");

        lastClaim[msg.sender] = block.timestamp;
        IERC20(token).transfer(msg.sender, claimAmount);
    }

    function setClaimAmount(uint256 amount) external onlyOwner {
        claimAmount = amount;
    }

    function setClaimCooldown(uint256 cooldown) external onlyOwner {
        claimCooldown = cooldown;
    }
}