// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable {
    event TokenCreated(address indexed tokenAddress, string name, string symbol, uint256 initialSupply);

    constructor() Ownable(msg.sender) {}

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address) {
        SimpleToken token = new SimpleToken(name, symbol, initialSupply, msg.sender);
        emit TokenCreated(address(token), name, symbol, initialSupply);
        return address(token);
    }
}

contract SimpleToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply);
    }
}