require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    neuratestnet: {
      url: process.env.NEURATESTNET_RPC_URL || "https://testnet.rpc.neuraprotocol.io/",
      chainId: 267,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      neuratestnet: "abc", // Neura might not have Etherscan verification
    },
    customChains: [
      {
        network: "neuratestnet",
        chainId: 267,
        urls: {
          apiURL: "https://testnet-blockscout.infra.neuraprotocol.io/api",
          browserURL: "https://testnet-blockscout.infra.neuraprotocol.io"
        }
      }
    ]
  },
  sourcify: {
    enabled: false
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};