const hre = require("hardhat");

async function main() {
  console.log("Deploying ClothingNFT contract to Polygon Amoy...");

  // Get the ContractFactory and Signers
  const ClothingNFT = await hre.ethers.getContractFactory("ClothingNFT");
  
  // Deploy the contract
  const clothingNFT = await ClothingNFT.deploy(
    "Web3Store Clothing",  // name
    "W3SC"                 // symbol
  );

  await clothingNFT.waitForDeployment();

  const contractAddress = await clothingNFT.getAddress();
  console.log("ClothingNFT deployed to:", contractAddress);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await clothingNFT.deploymentTransaction().wait(5);

  // Verify the contract on Polygonscan
  try {
    console.log("Verifying contract...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        "Web3Store Clothing",
        "W3SC"
      ],
    });
    console.log("Contract verified successfully");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("\nIMPORTANT: Add this contract address to your .env file:");
  console.log(`VITE_NFT_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\nYou can view your contract on Polygonscan:");
  console.log(`https://amoy.polygonscan.com/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });