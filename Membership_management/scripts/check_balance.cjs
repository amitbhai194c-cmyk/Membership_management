const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.JsonRpcProvider("https://rpc-testnet.nerochain.io");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log("Address:", wallet.address);
    console.log("Balance:", ethers.formatEther(balance), "NERO");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
