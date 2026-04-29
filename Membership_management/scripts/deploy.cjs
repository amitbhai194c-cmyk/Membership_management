const hre = require("hardhat");

async function main() {
  console.log("Deploying MembershipManagement...");

  const MembershipManagement = await hre.ethers.getContractFactory("MembershipManagement");
  const contract = await MembershipManagement.deploy();

  await contract.waitForDeployment();

  console.log("MembershipManagement deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
