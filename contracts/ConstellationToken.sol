// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ConstellationToken
 * @dev CONS - The native reward token for Constellation DEX
 * Total Supply: 100,000,000 CONS
 */
contract ConstellationToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18;
    
    // Minting caps
    uint256 public mintedForFarming;
    uint256 public mintedForTeam;
    uint256 public mintedForMarketing;
    
    uint256 public constant FARMING_CAP = 60_000_000 * 10**18; // 60%
    uint256 public constant TEAM_CAP = 20_000_000 * 10**18; // 20%
    uint256 public constant MARKETING_CAP = 20_000_000 * 10**18; // 20%
    
    address public masterChef;
    
    event MasterChefSet(address indexed masterChef);
    
    constructor() ERC20("Constellation Token", "CONS") {
        // Initial mint for liquidity
        _mint(msg.sender, 10_000_000 * 10**18);
    }
    
    modifier onlyMasterChef() {
        require(msg.sender == masterChef, "Only MasterChef can call");
        _;
    }
    
    function setMasterChef(address _masterChef) external onlyOwner {
        require(_masterChef != address(0), "Invalid address");
        masterChef = _masterChef;
        emit MasterChefSet(_masterChef);
    }
    
    function mintForFarming(address to, uint256 amount) external onlyMasterChef {
        require(mintedForFarming + amount <= FARMING_CAP, "Farming cap exceeded");
        mintedForFarming += amount;
        _mint(to, amount);
    }
    
    function mintForTeam(address to, uint256 amount) external onlyOwner {
        require(mintedForTeam + amount <= TEAM_CAP, "Team cap exceeded");
        mintedForTeam += amount;
        _mint(to, amount);
    }
    
    function mintForMarketing(address to, uint256 amount) external onlyOwner {
        require(mintedForMarketing + amount <= MARKETING_CAP, "Marketing cap exceeded");
        mintedForMarketing += amount;
        _mint(to, amount);
    }
}
