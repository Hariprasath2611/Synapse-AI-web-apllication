import React, { useState, useEffect } from 'react';
import { Search, Star, MessageSquare, Shield, DollarSign, ArrowUpRight, Cpu, CheckCircle } from 'lucide-react';

export default function Marketplace() {
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [buying, setBuying] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const categories = ['All', 'Coding', 'Business', 'Research', 'Marketing', 'Finance', 'Legal', 'Productivity'];

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        setAgents(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || agent.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = async (agent) => {
    setBuying(true);
    setPurchased(false);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: agent._id,
          amount: agent.price || 19,
          currency: 'usd',
          gateway: 'stripe'
        })
      });
      const data = await res.json();
      if (data.url) {
        // In local/sandbox, this redirects to local dashboard checkout callback
        window.location.href = data.url;
      } else {
        setPurchased(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative h-full">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Acquire pre-trained agent templates</span>
          <h1 className="text-2xl font-extrabold text-white">AI Agent Marketplace</h1>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search agents by prompt keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:border-cyber-purple outline-none"
          />
          <Search className="absolute left-3.5 top-2.5 text-white/40" size={16} />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-cyber-cyan text-cyber-dark font-bold'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <div 
            key={agent._id} 
            onClick={() => setSelectedAgent(agent)}
            className="glass-card p-6 rounded-2xl border-white/15 flex flex-col justify-between hover:border-cyber-purple/40 hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyber-purple to-cyber-cyan flex items-center justify-center font-bold text-white text-lg">
                  {agent.name ? agent.name[0] : 'A'}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Star size={12} className="fill-amber-400" /> {agent.rating || 4.5}
                </div>
              </div>

              <h3 className="font-extrabold text-white text-lg group-hover:text-cyber-cyan transition-colors mb-2">{agent.name}</h3>
              <p className="text-white/60 text-xs line-clamp-3 leading-relaxed mb-6">{agent.description || 'Custom autonomous agent.'}</p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-sm font-extrabold text-white">
                {agent.price > 0 ? `$${agent.price}/${agent.billingType === 'subscription' ? 'mo' : 'once'}` : 'Free'}
              </span>
              <span className="text-[10px] text-cyber-cyan font-mono uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                {agent.category}
              </span>
            </div>
          </div>
        ))}
        {filteredAgents.length === 0 && (
          <div className="col-span-full py-16 text-center glass-card rounded-2xl text-white/40 text-sm">
            No agents found matching your filter options.
          </div>
        )}
      </div>

      {/* Detailed dialog drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 border-white/15 relative overflow-hidden animate-zoom-in">
            <div className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer" onClick={() => { setSelectedAgent(null); setPurchased(false); }}>
              Cancel
            </div>

            <div className="flex gap-4 items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyber-purple to-cyber-cyan flex items-center justify-center font-bold text-white text-xl">
                {selectedAgent.name ? selectedAgent.name[0] : 'A'}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-xl">{selectedAgent.name}</h3>
                <span className="text-xs text-cyber-cyan font-mono uppercase">{selectedAgent.category}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8 text-xs">
              <div>
                <span className="block text-white/40 font-bold mb-1 uppercase tracking-wider">Objective Instructions</span>
                <p className="text-white/80 leading-relaxed font-mono bg-white/5 p-3 rounded-xl border border-white/5">{selectedAgent.goals}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-white/40 font-bold mb-1 uppercase tracking-wider">Vector Memory Sync</span>
                  <p className="text-white font-medium capitalize">{selectedAgent.memoryType}</p>
                </div>
                <div>
                  <span className="block text-white/40 font-bold mb-1 uppercase tracking-wider">Model Node</span>
                  <p className="text-white font-medium">Gemini 1.5 Flash</p>
                </div>
              </div>
            </div>

            {purchased ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-sm">
                <CheckCircle size={20} />
                <span>Agent successfully leased! Available in your Chat Arena.</span>
              </div>
            ) : (
              <button
                onClick={() => handleCheckout(selectedAgent)}
                disabled={buying}
                className="w-full py-3 bg-gradient-to-r from-cyber-purple to-cyber-cyan hover:opacity-90 text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {buying ? 'Connecting gateway...' : `Subscribe for $${selectedAgent.price || 19}/month`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
