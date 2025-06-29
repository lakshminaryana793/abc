const hre = require("hardhat");

async function main() {
  console.log("Deploying ClothingNFT contract to", hre.network.name, "...");

  // Get the ContractFactory and Signers here
  const ClothingNFT = await hre.ethers.getContractFactory("ClothingNFT");
  
  // Deploy the contract
  const clothingNFT = await ClothingNFT.deploy();
  
  await clothingNFT.deployed();

  console.log("ClothingNFT deployed to:", clothingNFT.address);

  // Wait for a few block confirmations
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await clothingNFT.deployTransaction.wait(6);
    
    // Verify the contract on Etherscan/Polygonscan
    try {
      console.log("Verifying contract...");
      await hre.run("verify:verify", {
        address: clothingNFT.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Contract Address:", clothingNFT.address);
  console.log("Deployer:", await clothingNFT.owner());
  console.log("\nUpdate your .env file with:");
  console.log(`VITE_NFT_CONTRACT_ADDRESS=${clothingNFT.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });