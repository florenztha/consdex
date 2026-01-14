// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Cons is ERC20, Ownable {
    address public masterChef;

    constructor() ERC20("Constellation Token", "CONS") Ownable(msg.sender) {
        _mint(msg.sender, 21_000_000 * 10**decimals());
    }

    function setMasterChef(address _masterChef) external onlyOwner {
        masterChef = _masterChef;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == masterChef, "Only MasterChef can mint");
        _mint(to, amount);
    }
}