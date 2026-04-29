const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.JsonRpcProvider("https://rpc-testnet.nerochain.io");
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const abi = [
        "function getMemberCount() view returns (uint256)"
    ];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
        const count = await contract.getMemberCount();
        console.log("Member Count:", count.toString());
    } catch (error) {
        console.error("Error interacting with contract:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
