import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Starting deployment...");

  // Get the deployer/signer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // 1. Deploy Cons Token
  console.log("\n1. Deploying Cons Token...");
  const Cons = await ethers.getContractFactory("Cons");
  const cons = await Cons.deploy();
  await cons.deployed();
  console.log("Cons deployed to:", cons.address);

  // 2. Deploy Factory
  console.log("\n2. Deploying Factory...");
  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);

  // 3. Deploy Router (assuming WETH is 0x0 for now)
  console.log("\n3. Deploying Router...");
  const Router = await ethers.getContractFactory("Router");
  const router = await Router.deploy(factory.address, ethers.constants.AddressZero);
  await router.deployed();
  console.log("Router deployed to:", router.address);

  // 4. Deploy MasterChef
  console.log("\n4. Deploying MasterChef...");
  const MasterChef = await ethers.getContractFactory("MasterChef");
  const masterChef = await MasterChef.deploy(
    cons.address,
    ethers.utils.parseEther("0.5"), // CONS per block
    await ethers.provider.getBlockNumber()
  );
  await masterChef.deployed();
  console.log("MasterChef deployed to:", masterChef.address);

  // Set MasterChef in Cons
  await cons.setMasterChef(masterChef.address);

  // 5. Deploy Zodiac Tokens
  console.log("\n5. Deploying Zodiac Tokens...");
  const zodiacTokens = [
    "AriesToken",
    "TaurusToken",
    "GeminiToken",
    "CancerToken",
    "LeoToken",
    "VirgoToken",
    "LibraToken",
    "ScorpioToken",
    "SagittariusToken",
    "CapricornToken",
    "AquariusToken",
    "PiscesToken"
  ];

  const zodiacAddresses = {};

  for (const tokenName of zodiacTokens) {
    console.log(`Deploying ${tokenName}...`);
    const ZodiacToken = await ethers.getContractFactory(tokenName);
    const zodiacToken = await ZodiacToken.deploy();
    await zodiacToken.deployed();
    zodiacAddresses[tokenName] = zodiacToken.address;
    console.log(`${tokenName} deployed to:`, zodiacToken.address);
  }

  // 6. Deploy Faucet
  console.log("\n6. Deploying Faucet...");
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await Faucet.deploy();
  await faucet.deployed();
  console.log("Faucet deployed to:", faucet.address);

  // Add tokens to faucet
  for (const addr of Object.values(zodiacAddresses)) {
    await faucet.addToken(addr);
  }
  await faucet.addToken(cons.address);

  console.log("\n=== Deployment Summary ===");
  console.log("Cons:", cons.address);
  console.log("Factory:", factory.address);
  console.log("Router:", router.address);
  console.log("MasterChef:", masterChef.address);
  console.log("Faucet:", faucet.address);
  console.log("Zodiac Tokens:", zodiacAddresses);

  // Update your contracts.js file
  console.log("\n=== Update your contracts.js with these addresses ===");
  console.log(`
  export const CONTRACTS = {
    CONS: '${cons.address}',
    FACTORY: '${factory.address}',
    ROUTER: '${router.address}',
    MASTER_CHEF: '${masterChef.address}',
    FAUCET: '${faucet.address}',
    ZODIAC_TOKENS: ${JSON.stringify(zodiacAddresses, null, 2)}
  }
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });