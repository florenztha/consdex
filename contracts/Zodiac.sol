// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZodiacToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 supply) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, supply);
    }
}

contract AriesToken is ZodiacToken {
    constructor() ZodiacToken("Aries Token", "ARIES", 21_000_000 * 10**18) {}
}

contract TaurusToken is ZodiacToken {
    constructor() ZodiacToken("Taurus Token", "TAURUS", 21_000_000 * 10**18) {}
}

contract GeminiToken is ZodiacToken {
    constructor() ZodiacToken("Gemini Token", "GEMINI", 21_000_000 * 10**18) {}
}

contract CancerToken is ZodiacToken {
    constructor() ZodiacToken("Cancer Token", "CANCER", 21_000_000 * 10**18) {}
}

contract LeoToken is ZodiacToken {
    constructor() ZodiacToken("Leo Token", "LEO", 21_000_000 * 10**18) {}
}

contract VirgoToken is ZodiacToken {
    constructor() ZodiacToken("Virgo Token", "VIRGO", 21_000_000 * 10**18) {}
}

contract LibraToken is ZodiacToken {
    constructor() ZodiacToken("Libra Token", "LIBRA", 21_000_000 * 10**18) {}
}

contract ScorpioToken is ZodiacToken {
    constructor() ZodiacToken("Scorpio Token", "SCORPIO", 21_000_000 * 10**18) {}
}

contract SagittariusToken is ZodiacToken {
    constructor() ZodiacToken("Sagittarius Token", "SAGITTARIUS", 21_000_000 * 10**18) {}
}

contract CapricornToken is ZodiacToken {
    constructor() ZodiacToken("Capricorn Token", "CAPRICORN", 21_000_000 * 10**18) {}
}

contract AquariusToken is ZodiacToken {
    constructor() ZodiacToken("Aquarius Token", "AQUARIUS", 21_000_000 * 10**18) {}
}

contract PiscesToken is ZodiacToken {
    constructor() ZodiacToken("Pisces Token", "PISCES", 21_000_000 * 10**18) {}
}