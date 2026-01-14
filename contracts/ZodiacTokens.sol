// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZodiacToken
 * @dev Base contract for all 12 Zodiac tokens
 * Each token has a total supply of 21,000,000
 */
contract ZodiacToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 21_000_000 * 10**18;
    uint256 public constant FAUCET_AMOUNT = 500 * 10**18;
    
    mapping(address => uint256) public lastFaucetClaim;
    
    event FaucetClaim(address indexed user, uint256 amount);
    
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + 1 days,
            "Can only claim once per day"
        );
        require(balanceOf(owner()) >= FAUCET_AMOUNT, "Faucet empty");
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _transfer(owner(), msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaim(msg.sender, FAUCET_AMOUNT);
    }
    
    function canClaimFaucet(address user) external view returns (bool) {
        return block.timestamp >= lastFaucetClaim[user] + 1 days;
    }
    
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (block.timestamp >= lastFaucetClaim[user] + 1 days) {
            return 0;
        }
        return (lastFaucetClaim[user] + 1 days) - block.timestamp;
    }
}

// Individual Zodiac Token Contracts
contract AriesToken is ZodiacToken {
    constructor() ZodiacToken("Aries Token", "ARIES") {}
}

contract TaurusToken is ZodiacToken {
    constructor() ZodiacToken("Taurus Token", "TAURUS") {}
}

contract GeminiToken is ZodiacToken {
    constructor() ZodiacToken("Gemini Token", "GEMINI") {}
}

contract CancerToken is ZodiacToken {
    constructor() ZodiacToken("Cancer Token", "CANCER") {}
}

contract LeoToken is ZodiacToken {
    constructor() ZodiacToken("Leo Token", "LEO") {}
}

contract VirgoToken is ZodiacToken {
    constructor() ZodiacToken("Virgo Token", "VIRGO") {}
}

contract LibraToken is ZodiacToken {
    constructor() ZodiacToken("Libra Token", "LIBRA") {}
}

contract ScorpioToken is ZodiacToken {
    constructor() ZodiacToken("Scorpio Token", "SCORPIO") {}
}

contract SagittariusToken is ZodiacToken {
    constructor() ZodiacToken("Sagittarius Token", "SAGITTARIUS") {}
}

contract CapricornToken is ZodiacToken {
    constructor() ZodiacToken("Capricorn Token", "CAPRICORN") {}
}

contract AquariusToken is ZodiacToken {
    constructor() ZodiacToken("Aquarius Token", "AQUARIUS") {}
}

contract PiscesToken is ZodiacToken {
    constructor() ZodiacToken("Pisces Token", "PISCES") {}
}

/**
 * @title ZodiacDeployer
 * @dev Deploys all 12 Zodiac tokens at once
 */
contract ZodiacDeployer {
    address public aries;
    address public taurus;
    address public gemini;
    address public cancer;
    address public leo;
    address public virgo;
    address public libra;
    address public scorpio;
    address public sagittarius;
    address public capricorn;
    address public aquarius;
    address public pisces;
    
    event ZodiacTokensDeployed(address[12] tokens);
    
    constructor() {
        aries = address(new AriesToken());
        taurus = address(new TaurusToken());
        gemini = address(new GeminiToken());
        cancer = address(new CancerToken());
        leo = address(new LeoToken());
        virgo = address(new VirgoToken());
        libra = address(new LibraToken());
        scorpio = address(new ScorpioToken());
        sagittarius = address(new SagittariusToken());
        capricorn = address(new CapricornToken());
        aquarius = address(new AquariusToken());
        pisces = address(new PiscesToken());
        
        emit ZodiacTokensDeployed([
            aries, taurus, gemini, cancer, leo, virgo,
            libra, scorpio, sagittarius, capricorn, aquarius, pisces
        ]);
    }
    
    function getAllTokens() external view returns (address[12] memory) {
        return [
            aries, taurus, gemini, cancer, leo, virgo,
            libra, scorpio, sagittarius, capricorn, aquarius, pisces
        ];
    }
}
