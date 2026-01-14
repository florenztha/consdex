// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleToken
 * @dev Basic ERC20 token created by TokenFactory
 */
contract SimpleToken is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        address owner_
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
        _mint(owner_, totalSupply_);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}

/**
 * @title TokenFactory
 * @dev Factory contract for deploying new ERC20 tokens
 * Allows anyone to create custom tokens on Neura Testnet
 */
contract TokenFactory is Ownable {
    struct TokenInfo {
        address tokenAddress;
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        address creator;
        uint256 createdAt;
    }

    TokenInfo[] public allTokens;
    mapping(address => address[]) public tokensByCreator;
    mapping(address => bool) public isTokenFromFactory;

    uint256 public creationFee;
    
    event TokenCreated(
        address indexed creator,
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 totalSupply
    );
    event CreationFeeUpdated(uint256 newFee);

    constructor() {
        creationFee = 0; // Free on testnet
    }

    function createToken(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_
    ) external payable returns (address) {
        require(bytes(name_).length > 0, "Name required");
        require(bytes(symbol_).length > 0, "Symbol required");
        require(totalSupply_ > 0, "Supply must be > 0");
        require(msg.value >= creationFee, "Insufficient fee");

        SimpleToken newToken = new SimpleToken(
            name_,
            symbol_,
            decimals_,
            totalSupply_ * (10 ** decimals_),
            msg.sender
        );

        address tokenAddress = address(newToken);

        TokenInfo memory info = TokenInfo({
            tokenAddress: tokenAddress,
            name: name_,
            symbol: symbol_,
            decimals: decimals_,
            totalSupply: totalSupply_,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        allTokens.push(info);
        tokensByCreator[msg.sender].push(tokenAddress);
        isTokenFromFactory[tokenAddress] = true;

        emit TokenCreated(msg.sender, tokenAddress, name_, symbol_, totalSupply_);

        return tokenAddress;
    }

    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }

    function getAllTokens() external view returns (TokenInfo[] memory) {
        return allTokens;
    }

    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    function setCreationFee(uint256 _fee) external onlyOwner {
        creationFee = _fee;
        emit CreationFeeUpdated(_fee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(owner()).transfer(balance);
    }
}
