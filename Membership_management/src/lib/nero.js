import { ethers } from "ethers";

// This will be filled after deployment
export const CONTRACT_ADDRESS = "0x48B95518F0EaF940368b9d0faCd7d70360Fd1B45"; 

export const CONTRACT_ABI = [
  "function registerMember(string _id, address _wallet, string _name, string _email, string _tier, uint256 _joinedAt, uint256 _expiry)",
  "function upgradeTier(string _id, string _newTier)",
  "function renewMembership(string _id, uint256 _newExpiry)",
  "function suspendMember(string _id)",
  "function activateMember(string _id)",
  "function getMember(string _id) view returns (tuple(string id, address walletAddress, string name, string email, uint8 tier, uint256 joinedAt, uint256 expiry, bool isActive, bool exists))",
  "function getAllMembers() view returns (tuple(string id, address walletAddress, string name, string email, uint8 tier, uint256 joinedAt, uint256 expiry, bool isActive, bool exists)[])",
  "function getMemberCount() view returns (uint256)",
  "function admin() view returns (address)"
];

let provider;
let signer;
let contract;

export const initEthers = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    if (CONTRACT_ADDRESS) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
    return await signer.getAddress();
  }
  throw new Error("No crypto wallet found. Please install MetaMask.");
};

export const checkConnection = async () => {
  try {
    const address = await initEthers();
    return { publicKey: address };
  } catch (err) {
    console.error(err);
    return null;
  }
};

const getContract = async () => {
  if (!contract) {
    await initEthers();
  }
  if (!contract) throw new Error("Contract address not set in src/lib/nero.js");
  return contract;
};

const tierMap = ["basic", "silver", "gold", "platinum"];

export const registerMember = async (p) => {
  const c = await getContract();
  const tx = await c.registerMember(p.id, p.member, p.name, p.email, p.tier, p.joinedAt, p.expiry || 0);
  const receipt = await tx.wait();
  return { success: true, hash: receipt.hash };
};

export const upgradeTier = async (p) => {
  const c = await getContract();
  const tx = await c.upgradeTier(p.id, p.newTier);
  const receipt = await tx.wait();
  return { success: true, hash: receipt.hash };
};

export const renewMembership = async (p) => {
  const c = await getContract();
  const tx = await c.renewMembership(p.id, p.newExpiry);
  const receipt = await tx.wait();
  return { success: true, hash: receipt.hash };
};

export const suspendMember = async (p) => {
  const c = await getContract();
  const tx = await c.suspendMember(p.id);
  const receipt = await tx.wait();
  return { success: true, hash: receipt.hash };
};

export const activateMember = async (p) => {
  const c = await getContract();
  const tx = await c.activateMember(p.id);
  const receipt = await tx.wait();
  return { success: true, hash: receipt.hash };
};

export const getMember = async (id) => {
  const c = await getContract();
  const res = await c.getMember(id);
  return {
    id: res.id,
    member: res.walletAddress,
    name: res.name,
    email: res.email,
    tier: tierMap[res.tier] || "unknown",
    joinedAt: res.joinedAt.toString(),
    expiry: res.expiry.toString(),
    isActive: res.isActive
  };
};

export const listMembers = async () => {
  const c = await getContract();
  const res = await c.getAllMembers();
  return res.map(m => ({
    id: m.id,
    member: m.walletAddress,
    name: m.name,
    tier: tierMap[m.tier] || "unknown"
  }));
};

export const getMemberCount = async () => {
  const c = await getContract();
  const count = await c.getMemberCount();
  return Number(count);
};
