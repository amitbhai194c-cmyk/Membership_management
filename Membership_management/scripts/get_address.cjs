const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log("Address:", wallet.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
