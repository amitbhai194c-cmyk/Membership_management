import React, { useState } from "react";
import { checkConnection, registerMember, upgradeTier, renewMembership, suspendMember, activateMember, getMember, listMembers, getMemberCount } from "./lib/nero";
import "./App.css";

const nowTs = () => Math.floor(Date.now() / 1000);
const oneYearFromNow = () => nowTs() + 365 * 24 * 60 * 60;

const initialForm = () => ({
    id: "mem1",
    member: "",
    admin: "",
    name: "John Doe",
    email: "john@example.com",
    tier: "basic",
    newTier: "silver",
    joinedAt: String(nowTs()),
    newExpiry: String(oneYearFromNow()),
});

const toOutput = (value) => {
    if (typeof value === "string") return value;
    return JSON.stringify(value, (key, val) => typeof val === "bigint" ? val.toString() : val, 2);
};

const truncateAddr = (addr) => addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

export default function App() {
    const [form, setForm] = useState(initialForm);
    const [output, setOutput] = useState("Ready.");
    const [walletState, setWalletState] = useState(null);
    const [isBusy, setIsBusy] = useState(false);
    const [countValue, setCountValue] = useState("-");
    const [loadingAction, setLoadingAction] = useState(null);
    const [status, setStatus] = useState("idle");
    const [activeTab, setActiveTab] = useState("register");
    const [confirmAction, setConfirmAction] = useState(null);

    const setField = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const runAction = async (actionName, action) => {
        setIsBusy(true);
        setLoadingAction(actionName);
        setStatus("idle");
        try {
            const result = await action();
            setOutput(toOutput(result ?? "No data found"));
            setStatus("success");
        } catch (error) {
            setOutput(error?.message || String(error));
            setStatus("error");
        } finally {
            setIsBusy(false);
            setLoadingAction(null);
        }
    };

    const handleDestructive = (actionName, fn) => {
        if (confirmAction === actionName) {
            setConfirmAction(null);
            fn();
        } else {
            setConfirmAction(actionName);
            setTimeout(() => setConfirmAction(null), 3000);
        }
    };

    const onConnect = () => runAction("connect", async () => {
        const user = await checkConnection();
        if (user) {
            setWalletState(user.publicKey);
            setForm((prev) => ({ ...prev, member: user.publicKey, admin: user.publicKey }));
        } else {
            setWalletState(null);
        }
        return user ? `Connected: ${user.publicKey}` : "Wallet: not connected";
    });

    const onRegister = () => runAction("register", async () => registerMember({
        id: form.id.trim(),
        member: form.member.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        tier: form.tier.trim(),
        joinedAt: Number(form.joinedAt.trim() || nowTs()),
        expiry: Number(form.newExpiry.trim() || oneYearFromNow()),
    }));

    const onUpgradeTier = () => runAction("upgradeTier", async () => upgradeTier({
        id: form.id.trim(),
        newTier: form.newTier.trim(),
    }));

    const onRenew = () => runAction("renew", async () => renewMembership({
        id: form.id.trim(),
        newExpiry: Number(form.newExpiry.trim() || oneYearFromNow()),
    }));

    const onSuspend = () => runAction("suspend", async () => suspendMember({
        id: form.id.trim(),
    }));

    const onActivate = () => runAction("activate", async () => activateMember({
        id: form.id.trim(),
    }));

    const onGetMember = () => runAction("getMember", async () => getMember(form.id.trim()));
    const onListMembers = () => runAction("listMembers", async () => listMembers());

    const onGetCount = () => runAction("getCount", async () => {
        const value = await getMemberCount();
        setCountValue(String(value));
        return { count: value };
    });

    const btnClass = (actionName, base) =>
        `${base}${loadingAction === actionName ? " btn-loading" : ""}`;

    const tabs = [
        { key: "register", label: "Register" },
        { key: "controls", label: "Controls" },
        { key: "queries", label: "Queries" },
    ];

    return (
        <main className="app">
            {/* Header with Wallet Status */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-section">
                        <span className="logo-icon">👑</span>
                        <div className="logo-text">
                            <h1 className="app-title">Nero Membership</h1>
                            <p className="logo-subtitle">EVM Smart Contract</p>
                        </div>
                    </div>
                    <div className="wallet-bar-inline">
                        {walletState ? (
                            <div className="wallet-connected">
                                <span className="status-dot connected"></span>
                                <span className="wallet-addr">{truncateAddr(walletState)}</span>
                                <span className="wallet-badge">Connected</span>
                            </div>
                        ) : (
                            <>
                                <button type="button" className={btnClass("connect", "btn btn-primary-sm")} onClick={onConnect} disabled={isBusy}>
                                    🔗 Connect Wallet
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <span className="hero-icon">🏆</span>
                    <h2 className="hero-title">Nero Membership Management</h2>
                    <p className="hero-description">
                        A secure, decentralized membership platform built on Nero Chain's EVM smart contracts. Register members, manage tiers, renew subscriptions, and handle suspensions with complete on-chain transparency.
                    </p>
                    <div className="hero-features">
                        <div className="feature-item">
                            <span className="feature-icon">⚡</span>
                            <span>Register Members</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">⭐</span>
                            <span>Manage Tiers</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🔄</span>
                            <span>Renew Subscriptions</span>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🛡️</span>
                            <span>Suspend & Activate</span>
                        </div>
                    </div>
                    <div className="member-count-hero">
                        <span className="count-label">Total Members</span>
                        <span className="count-value">{countValue}</span>
                    </div>
                </div>
            </section>

            {/* Tab Navigation */}
            <nav className="tab-nav">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        className={`tab-btn${activeTab === t.key ? " active" : ""}`}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {/* Register Member */}
            {activeTab === "register" && (
                <section className="card">
                    <div className="card-header">
                        <span className="icon">{"\u{1F464}"}</span>
                        <h2>Register Member</h2>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="entryId">Member ID</label>
                            <input id="entryId" name="id" value={form.id} onChange={setField} />
                            <span className="helper">Unique identifier, max 32 characters</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="member">Member Wallet Address</label>
                            <input id="member" name="member" value={form.member} onChange={setField} placeholder="0x..." />
                            <span className="helper">EVM wallet address starting with 0x...</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input id="name" name="name" value={form.name} onChange={setField} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" value={form.email} onChange={setField} type="email" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tier">Tier</label>
                            <select id="tier" name="tier" value={form.tier} onChange={setField}>
                                <option value="basic">Basic</option>
                                <option value="silver">Silver</option>
                                <option value="gold">Gold</option>
                                <option value="platinum">Platinum</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="joinedAt">Joined At (timestamp)</label>
                            <input id="joinedAt" name="joinedAt" value={form.joinedAt} onChange={setField} type="number" />
                            <span className="helper">Unix timestamp in seconds</span>
                        </div>
                    </div>
                    <div className="actions">
                        <button type="button" className={btnClass("register", "btn btn-primary")} onClick={onRegister} disabled={isBusy}>Register Member</button>
                    </div>
                </section>
            )}

            {/* Membership Controls */}
            {activeTab === "controls" && (
                <section className="card">
                    <div className="card-header">
                        <span className="icon">{"\u2B50"}</span>
                        <h2>Membership Controls</h2>
                    </div>

                    <div className="tier-display">
                        <span className="tier-badge tier-basic">Basic</span>
                        <span className="tier-badge tier-silver">Silver</span>
                        <span className="tier-badge tier-gold">Gold</span>
                        <span className="tier-badge tier-platinum">Platinum</span>
                    </div>

                    <div className="controls-grid">
                        <div className="control-block">
                            <span className="label-text">Upgrade Tier</span>
                            <div className="form-group">
                                <label htmlFor="newTier">New Tier</label>
                                <select id="newTier" name="newTier" value={form.newTier} onChange={setField}>
                                    <option value="basic">Basic</option>
                                    <option value="silver">Silver</option>
                                    <option value="gold">Gold</option>
                                    <option value="platinum">Platinum</option>
                                </select>
                            </div>
                            <button type="button" className={btnClass("upgradeTier", "btn btn-outline")} onClick={onUpgradeTier} disabled={isBusy}>Upgrade Tier</button>
                        </div>

                        <div className="control-block">
                            <span className="label-text">Renew Membership</span>
                            <div className="form-group">
                                <label htmlFor="newExpiry">New Expiry (timestamp)</label>
                                <input id="newExpiry" name="newExpiry" value={form.newExpiry} onChange={setField} type="number" />
                                <span className="helper">Unix timestamp in seconds</span>
                            </div>
                            <button type="button" className={btnClass("renew", "btn btn-success")} onClick={onRenew} disabled={isBusy}>Renew Membership</button>
                        </div>

                        <div className="control-block">
                            <span className="label-text">Suspend Member</span>
                            <p style={{ fontSize: "0.82rem", color: "#78716c", marginBottom: "1rem" }}>Temporarily disable a member's access (Admin Only).</p>
                            <button
                                type="button"
                                className={btnClass("suspend", `btn btn-danger-outline${confirmAction === "suspend" ? " btn-confirm-pulse" : ""}`)}
                                onClick={() => handleDestructive("suspend", onSuspend)}
                                disabled={isBusy}
                            >
                                {confirmAction === "suspend" ? "Confirm Suspend?" : "Suspend Member"}
                            </button>
                        </div>

                        <div className="control-block">
                            <span className="label-text">Activate Member</span>
                            <p style={{ fontSize: "0.82rem", color: "#78716c", marginBottom: "1rem" }}>Reactivate a previously suspended membership (Admin Only).</p>
                            <button type="button" className={btnClass("activate", "btn btn-warning")} onClick={onActivate} disabled={isBusy}>Activate Member</button>
                        </div>
                    </div>
                </section>
            )}

            {/* Queries */}
            {activeTab === "queries" && (
                <section className="card">
                    <div className="card-header">
                        <span className="icon">{"\u{1F50D}"}</span>
                        <h2>Member Queries</h2>
                    </div>
                    <div className="actions-query">
                        <button type="button" className={btnClass("getMember", "btn btn-ghost")} onClick={onGetMember} disabled={isBusy}>Get Member</button>
                        <button type="button" className={btnClass("listMembers", "btn btn-ghost")} onClick={onListMembers} disabled={isBusy}>List Members</button>
                        <button type="button" className={btnClass("getCount", "btn btn-ghost")} onClick={onGetCount} disabled={isBusy}>Get Count</button>
                    </div>
                </section>
            )}

            {/* Output */}
            <section className="output-card">
                <div className="output-header">
                    {"\u{1F4AC}"} Output
                </div>
                <div className={`output-body output-${status}`}>
                    {output === "Ready." ? (
                        <p className="empty-state">Connect your wallet and perform an action to see results here.</p>
                    ) : (
                        <pre id="output">{output}</pre>
                    )}
                </div>
            </section>
        </main>
    );
}
