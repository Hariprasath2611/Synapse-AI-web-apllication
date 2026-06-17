import React, { useState, useEffect } from 'react';
import { Cpu, Play, BarChart2, Activity, Plus, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function DashboardOverview({ user, onNavigate }) {
  const [stats, setStats] = useState({
    activeAgents: 0,
    conversationsCount: 0,
    workflowExecutions: 0,
    dailyUsers: 0
  });
  const [userAgents, setUserAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats and user agents from express backend
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/analytics');
        const statsData = await statsRes.json();
        setStats(statsData.metrics || {});

        const agentsRes = await fetch('/api/agents');
        const agentsData = await agentsRes.json();
        setUserAgents(agentsData.slice(0, 3)); // show top 3 agents
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpis = [
    { label: 'Active AI Agents', value: stats.activeAgents || '42', icon: Cpu, color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/10' },
    { label: 'Total Conversations', value: stats.conversationsCount || '840', icon: Activity, color: 'text-cyber-purple', bg: 'bg-cyber-purple/10' },
    { label: 'Workflow Runs', value: stats.workflowExecutions || '245', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Platform Users', value: stats.dailyUsers || '1.4k', icon: BarChart2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyber-indigo via-cyber-purple to-cyber-dark p-8 border border-white/10 shadow-2xl">
        <div className="absolute inset-0 glow-mesh bg-cyber-cyan/10 top-0 left-0" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-white">
            Welcome back, {user.name || 'Developer'}!
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Build custom generative AI agents, script automated workflows, upload business vector memories, and lease high-performance scripts on the marketplace.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => onNavigate('builder')}
              className="px-5 py-2.5 bg-gradient-to-r from-cyber-purple to-cyber-cyan text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Create Agent
            </button>
            <button 
              onClick={() => onNavigate('workflow')}
              className="px-5 py-2.5 glass-card hover:bg-white/5 text-white text-sm font-semibold rounded-xl transition-all border-white/10 hover:border-white/20 flex items-center gap-2"
            >
              <Play size={16} /> Run Workflow
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-card p-6 rounded-2xl relative overflow-hidden flex items-center justify-between border-white/15">
              <div>
                <span className="block text-xs text-white/50 font-medium uppercase tracking-wider mb-1">{kpi.label}</span>
                <span className="block text-2xl font-bold text-white">{kpi.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Agents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Your AI Agents</h3>
            <button 
              onClick={() => onNavigate('builder')}
              className="text-xs text-cyber-cyan hover:underline flex items-center gap-1 font-semibold"
            >
              Configure all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw size={24} className="animate-spin text-cyber-cyan" />
            </div>
          ) : (
            <div className="space-y-4">
              {userAgents.map((agent) => (
                <div key={agent._id} className="glass-card p-5 rounded-2xl border-white/15 flex items-center justify-between hover:border-cyber-purple/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-purple to-cyber-cyan flex items-center justify-center font-bold text-white text-lg">
                      {agent.name ? agent.name[0] : 'A'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                      <p className="text-xs text-white/50 truncate max-w-sm">{agent.description || 'No description provided.'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-cyber-cyan font-mono uppercase">
                      {agent.personality}
                    </span>
                    <button 
                      onClick={() => onNavigate('conversations')}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                    >
                      <Play size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {userAgents.length === 0 && (
                <div className="text-center py-10 glass-card rounded-2xl border-white/10 text-white/40 text-sm">
                  You haven't created any agents yet. Click "Create Agent" above to start!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Recent Activity */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">Ecosystem Logs</h3>
          <div className="glass-card p-6 rounded-2xl border-white/15 space-y-4 max-h-[310px] overflow-y-auto">
            <div className="flex items-start gap-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan mt-1.5 shrink-0" />
              <div>
                <span className="block font-semibold text-white">Agent Coder Deployed</span>
                <p className="text-white/50 text-[11px]">Synced local repository files to vector index handbook.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyber-purple mt-1.5 shrink-0" />
              <div>
                <span className="block font-semibold text-white">Payout Dispatched</span>
                <p className="text-white/50 text-[11px]">Monthly earnings payout completed via Stripe Gateway.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
              <div>
                <span className="block font-semibold text-white">Workflow Update</span>
                <p className="text-white/50 text-[11px]">Webhook trigger lead qualification route linked successfully.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
