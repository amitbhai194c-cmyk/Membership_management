// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MembershipManagement {
    enum MembershipTier { Basic, Silver, Gold, Platinum }

    struct Member {
        string id;
        address walletAddress;
        string name;
        string email;
        MembershipTier tier;
        uint256 joinedAt;
        uint256 expiry;
        bool isActive;
        bool exists;
    }

    mapping(string => Member) private members;
    string[] private memberIds;
    address public admin;

    event MemberRegistered(string indexed id, address indexed wallet, string name);
    event TierUpgraded(string indexed id, MembershipTier newTier);
    event MembershipRenewed(string indexed id, uint256 newExpiry);
    event MemberStatusChanged(string indexed id, bool isActive);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier memberExists(string memory _id) {
        require(members[_id].exists, "Member does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerMember(
        string memory _id,
        address _wallet,
        string memory _name,
        string memory _email,
        string memory _tier,
        uint256 _joinedAt,
        uint256 _expiry
    ) public {
        require(!members[_id].exists, "Member ID already exists");
        
        MembershipTier tier = _parseTier(_tier);

        members[_id] = Member({
            id: _id,
            walletAddress: _wallet,
            name: _name,
            email: _email,
            tier: tier,
            joinedAt: _joinedAt,
            expiry: _expiry,
            isActive: true,
            exists: true
        });

        memberIds.push(_id);
        emit MemberRegistered(_id, _wallet, _name);
    }

    function upgradeTier(string memory _id, string memory _newTier) public memberExists(_id) {
        MembershipTier newTier = _parseTier(_newTier);
        members[_id].tier = newTier;
        emit TierUpgraded(_id, newTier);
    }

    function renewMembership(string memory _id, uint256 _newExpiry) public memberExists(_id) {
        members[_id].expiry = _newExpiry;
        emit MembershipRenewed(_id, _newExpiry);
    }

    function suspendMember(string memory _id) public onlyAdmin memberExists(_id) {
        members[_id].isActive = false;
        emit MemberStatusChanged(_id, false);
    }

    function activateMember(string memory _id) public onlyAdmin memberExists(_id) {
        members[_id].isActive = true;
        emit MemberStatusChanged(_id, true);
    }

    function getMember(string memory _id) public view memberExists(_id) returns (Member memory) {
        return members[_id];
    }

    function getAllMembers() public view returns (Member[] memory) {
        Member[] memory allMembers = new Member[](memberIds.length);
        for (uint256 i = 0; i < memberIds.length; i++) {
            allMembers[i] = members[memberIds[i]];
        }
        return allMembers;
    }

    function getMemberCount() public view returns (uint256) {
        return memberIds.length;
    }

    function _parseTier(string memory _tier) internal pure returns (MembershipTier) {
        bytes32 tierHash = keccak256(abi.encodePacked(_tier));
        if (tierHash == keccak256(abi.encodePacked("basic"))) return MembershipTier.Basic;
        if (tierHash == keccak256(abi.encodePacked("silver"))) return MembershipTier.Silver;
        if (tierHash == keccak256(abi.encodePacked("gold"))) return MembershipTier.Gold;
        if (tierHash == keccak256(abi.encodePacked("platinum"))) return MembershipTier.Platinum;
        revert("Invalid membership tier");
    }
    
    function setAdmin(address _newAdmin) public onlyAdmin {
        admin = _newAdmin;
    }
}
