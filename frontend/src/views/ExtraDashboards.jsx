import React, { useState, useEffect } from 'react';
import { 
  BarChart2, DollarSign, Users, ShieldAlert, Settings as SettingsIcon, 
  TrendingUp, RefreshCw, Key, Plus, Star, Check, Trash2, ArrowUpRight 
} from 'lucide-react';

// --- ANALYTICS DASHBOARD ---
export function AnalyticsDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">System-wide performance telemetry</span>
        <h1 className="text-2xl font-extrabold text-white">Analytics Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border-white/10">
          <span className="block text-xs text-white/50 mb-1">Average Response Latency</span>
          <span className="block text-2xl font-bold text-cyber-cyan font-mono">1.2s</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border-white/10">
          <span className="block text-xs text-white/50 mb-1">Model Reasoning Accuracy</span>
          <span className="block text-2xl font-bold text-cyber-purple font-mono">98.4%</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border-white/10">
          <span className="block text-xs text-white/50 mb-1">Total Token Accumulations</span>
          <span className="block text-2xl font-bold text-indigo-450 font-mono">420,840</span>
        </div>
      </div>

      {/* Simulated bar layout charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conversations per Agent</h3>
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-white/70 mb-1.5 font-semibold">
                <span>Synapse Coder</span>
                <span>450 calls</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div className="bg-cyber-purple h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-white/70 mb-1.5 font-semibold">
                <span>Startup Advisor</span>
                <span>280 calls</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div className="bg-cyber-cyan h-full rounded-full" style={{ width: '55%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-white/70 mb-1.5 font-semibold">
                <span>RAG Researcher</span>
                <span>110 calls</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly API Request Anomalies</h3>
          <div className="text-xs space-y-3 font-mono">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-between">
              <span>Traffic Spike: June 15, 14:02 UTC</span>
              <span className="font-bold text-[10px] uppercase">Anomaly Flagged</span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-between">
              <span>Normal Bounds: June 16, 09:30 UTC</span>
              <span className="font-bold text-[10px] uppercase">Healthy</span>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-between">
              <span>Normal Bounds: June 17, 12:44 UTC</span>
              <span className="font-bold text-[10px] uppercase">Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- REVENUE DASHBOARD ---
export function RevenueDashboard() {
  const [balance, setBalance] = useState(14820);
  const [loading, setLoading] = useState(false);

  const triggerPayout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Payout initiated! $420.00 will be deposited to Stripe connected account.');
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Creator Earnings & subscriptions</span>
          <h1 className="text-2xl font-extrabold text-white">Revenue Portal</h1>
        </div>
        <button
          onClick={triggerPayout}
          disabled={loading}
          className="px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/90 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <DollarSign size={14} />}
          Request Payout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border-white/10">
          <span className="block text-xs text-white/50 mb-1">Total Marketplace Sales</span>
          <span className="block text-3xl font-extrabold text-white font-mono">${balance.toLocaleString()}</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border-white/10">
          <span className="block text-xs text-white/50 mb-1">Pending Creator Balance</span>
          <span className="block text-3xl font-extrabold text-cyber-cyan font-mono">$420.00</span>
        </div>
        <div className="glass-card p-6 rounded-2xl border-white/10">
          <span className="block text-xs text-white/50 mb-1">Active Subscribers</span>
          <span className="block text-3xl font-extrabold text-cyber-purple font-mono">142</span>
        </div>
      </div>

      {/* Transaction Records */}
      <div className="glass-card p-6 rounded-2xl border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Subscribers Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-white/40 uppercase font-bold tracking-wider">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Customer Profile</th>
                <th className="pb-3">Agent Template</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Billing System</th>
              </tr>
            </thead>
            <tbody className="text-white/80 font-mono">
              <tr className="border-b border-white/5">
                <td className="py-3.5">tx_a982df82</td>
                <td>user_beta_99</td>
                <td>Synapse Coder</td>
                <td>$19.00</td>
                <td><span className="px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-cyan border border-cyber-cyan/30 text-[10px]">Stripe Checkout</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3.5">tx_c772ef12</td>
                <td>merchant_gamma</td>
                <td>RAG Researcher</td>
                <td>$49.00</td>
                <td><span className="px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-cyan border border-cyber-cyan/30 text-[10px]">Stripe Checkout</span></td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3.5">tx_r002ff11</td>
                <td>team_alpha_ind</td>
                <td>Startup Advisor</td>
                <td>$0.00</td>
                <td><span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">Razorpay UPI</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- TEAM WORKSPACE ---
export function TeamWorkspace() {
  const [members, setMembers] = useState([
    { name: 'Hariprasath', email: 'creator@synapse.ai', role: 'Creator / Owner' },
    { name: 'John Doe', email: 'john@example.com', role: 'Collaborator' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setMembers(prev => [...prev, { name: 'Invited Member', email: inviteEmail, role: 'Collaborator' }]);
    setInviteEmail('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Organizations and shared configurations</span>
        <h1 className="text-2xl font-extrabold text-white">Team Workspace</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Members</h3>
          <div className="space-y-3 text-xs">
            {members.map((m, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="block font-bold text-white">{m.name}</span>
                  <span className="block text-[10px] text-white/50">{m.email}</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-cyber-purple/20 text-cyber-cyan text-[10px] font-mono border border-cyber-cyan/25 uppercase">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invite Member</h3>
          <form onSubmit={handleInvite} className="space-y-4 text-xs">
            <div>
              <label className="block text-white/50 mb-1.5">Collaborator Email</label>
              <input
                type="email"
                placeholder="developer@agency.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyber-purple"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-cyber-purple hover:bg-cyber-purple/90 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> Invite to Team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- ADMIN PANEL ---
export function AdminPanel() {
  const [agentsQueue, setAgentsQueue] = useState([
    { id: 'aq1', name: 'Legal Drafting Node', description: 'Review business clauses and generate documents.', creator: 'creator@agency.ai' }
  ]);

  const handleApprove = (id) => {
    setAgentsQueue(prev => prev.filter(x => x.id !== id));
    alert('Agent published to public marketplace successfully!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Global marketplace moderation queue</span>
        <h1 className="text-2xl font-extrabold text-white">Admin Moderation</h1>
      </div>

      <div className="glass-card p-6 rounded-2xl border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Marketplace Approvals Required</h3>
        <div className="space-y-4 text-xs">
          {agentsQueue.map(item => (
            <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="block font-bold text-white text-sm">{item.name}</span>
                <p className="text-white/50 text-[11px] mb-1">{item.description}</p>
                <span className="block text-[10px] text-cyber-cyan font-mono">Submitted by: {item.creator}</span>
              </div>
              <button
                onClick={() => handleApprove(item.id)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold font-mono text-[10px] uppercase"
              >
                Approve & Publish
              </button>
            </div>
          ))}
          {agentsQueue.length === 0 && (
            <div className="text-center py-10 text-white/40">
              No agents currently pending moderation review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SETTINGS PANEL ---
export function Settings() {
  const [keys, setKeys] = useState({
    gemini: 'GEMINI_API_KEY_SECURED_8877',
    stripe: 'STRIPE_API_KEY_SECURED_0022',
    pinecone: 'PINECONE_API_KEY_SECURED_3311'
  });
  const [success, setSuccess] = useState(false);

  const handleSaveKeys = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Configure secret API integrations</span>
        <h1 className="text-2xl font-extrabold text-white">System Settings</h1>
      </div>

      <div className="glass-card p-6 rounded-2xl border-white/10 max-w-xl space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key size={16} className="text-cyber-cyan" /> API Credentials Integrations
        </h3>
        
        <form onSubmit={handleSaveKeys} className="space-y-4 text-xs">
          <div>
            <label className="block text-white/50 mb-1.5 font-medium">Gemini AI API Key</label>
            <input
              type="password"
              value={keys.gemini}
              onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyber-purple font-mono"
            />
          </div>
          <div>
            <label className="block text-white/50 mb-1.5 font-medium">Stripe API Secret</label>
            <input
              type="password"
              value={keys.stripe}
              onChange={(e) => setKeys({ ...keys, stripe: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyber-purple font-mono"
            />
          </div>
          <div>
            <label className="block text-white/50 mb-1.5 font-medium">Pinecone Vector Database Token</label>
            <input
              type="password"
              value={keys.pinecone}
              onChange={(e) => setKeys({ ...keys, pinecone: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyber-purple font-mono"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2">
              <Check size={16} /> API Integration keys updated locally.
            </div>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 bg-cyber-purple hover:bg-cyber-purple/90 text-white rounded-xl font-bold"
          >
            Save Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
