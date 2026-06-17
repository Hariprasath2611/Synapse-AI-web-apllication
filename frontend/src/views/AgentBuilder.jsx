import React, { useState, useEffect } from 'react';
import { Cpu, Send, Check, Play, RefreshCw, Terminal, Eye, Save, Sparkles, BookOpen, Layers } from 'lucide-react';

export default function AgentBuilder() {
  // Form state
  const [form, setForm] = useState({
    name: 'New Agent',
    description: 'Autonomous assistant trained to resolve custom objectives.',
    goals: 'Respond to queries and analyze incoming prompts.',
    personality: 'Chat',
    category: 'General',
    price: 0,
    billingType: 'free',
    tools: [],
    memoryType: 'short-term',
    knowledgeBases: [],
    isPublished: false
  });

  const [kbs, setKbs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sandbox chat state
  const [messages, setMessages] = useState([
    { sender: 'assistant', senderName: 'Sandbox Agent', content: "Hello! I am initialized with your prompt config. Type anything to test my reasoning cycles." }
  ]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sandboxConvoId, setSandboxConvoId] = useState(null);

  const personalities = ['Chat', 'Coding', 'Business', 'Research', 'Healthcare', 'Legal'];
  const categories = ['Coding', 'Education', 'Business', 'Marketing', 'Finance', 'Healthcare', 'Research', 'Legal', 'Productivity'];
  const availableTools = ['Google Search', 'Web Scraper', 'Code Executor', 'PDF Parser', 'Slack Publisher'];

  useEffect(() => {
    // Fetch Knowledgebases to link
    const fetchKbs = async () => {
      try {
        const res = await fetch('/api/knowledge');
        const data = await res.json();
        setKbs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchKbs();
  }, []);

  const handleToolToggle = (tool) => {
    const nextTools = form.tools.includes(tool)
      ? form.tools.filter(t => t !== tool)
      : [...form.tools, tool];
    setForm({ ...form, tools: nextTools });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Run a real prompt generation loop via Express `/api/conversations`
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', senderName: 'You', content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setChatLoading(true);

    try {
      let convoId = sandboxConvoId;
      // Initialize convo if not present
      if (!convoId) {
        const convoRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `Sandbox: ${form.name}` })
        });
        const convoData = await convoRes.json();
        convoId = convoData._id;
        setSandboxConvoId(convoId);
      }

      // POST user message + agent specification to invoke Gemini API loop
      const res = await fetch(`/api/conversations/${convoId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'user',
          senderName: 'You',
          content: userMsg.content,
          agentId: 'a1', // use preloaded mock ID or configure sandbox agent properties
          sandboxAgent: form // pass current builder settings to compile prompt instructions
        })
      });
      const data = await res.json();
      
      // Wait for reply and append
      const historyRes = await fetch(`/api/conversations/${convoId}/messages`);
      const historyData = await historyRes.json();
      const lastMsg = historyData[historyData.length - 1];
      if (lastMsg && lastMsg.sender !== 'user') {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          senderName: lastMsg.senderName || form.name,
          content: lastMsg.content
        }]);
      }
    } catch (err) {
      console.error('Sandbox error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
      {/* Left side - Config panels */}
      <div className="lg:col-span-2 overflow-y-auto pr-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Configure personality & memory</span>
            <h1 className="text-2xl font-extrabold text-white">AI Agent Designer</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-cyber-purple hover:bg-cyber-purple/80 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : saveSuccess ? <Check size={14} /> : <Save size={14} />}
            {saveSuccess ? 'Saved!' : 'Save Config'}
          </button>
        </div>

        {/* Identity Section */}
        <div className="glass-card p-6 rounded-2xl border-white/15 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={16} className="text-cyber-cyan" /> 1. Agent Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Agent Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyber-purple outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">System Personality Class</label>
              <select 
                value={form.personality}
                onChange={(e) => setForm({ ...form, personality: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-white/10 rounded-xl text-white text-sm focus:border-cyber-purple outline-none"
              >
                {personalities.map((p, idx) => (
                  <option key={idx} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Short Description</label>
            <input 
              type="text" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyber-purple outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Agent Objective / System Prompt instructions</label>
            <textarea 
              rows={3} 
              value={form.goals} 
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-cyber-purple outline-none font-mono" 
            />
          </div>
        </div>

        {/* Tools and Capabilities */}
        <div className="glass-card p-6 rounded-2xl border-white/15 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-cyber-purple" /> 2. Capabilities & Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableTools.map((tool, idx) => {
              const active = form.tools.includes(tool);
              return (
                <button
                  key={idx}
                  onClick={() => handleToolToggle(tool)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    active 
                      ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan' 
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {tool}
                  {active && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Knowledge Bases Linking */}
        <div className="glass-card p-6 rounded-2xl border-white/15 space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" /> 3. Knowledge & Memory Base
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Select Vector Memory Sync Type</label>
              <select 
                value={form.memoryType}
                onChange={(e) => setForm({ ...form, memoryType: e.target.value })}
                className="w-full px-3 py-2 bg-cyber-dark border border-white/10 rounded-xl text-white text-sm focus:border-cyber-purple outline-none"
              >
                <option value="short-term">Short-Term Memory Only</option>
                <option value="long-term">Long-Term Conversation Log Memory</option>
                <option value="pinecone">Pinecone Vector Document Embedding</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 font-medium">Link Knowledge Base Docs</label>
              <select 
                multiple
                value={form.knowledgeBases}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  setForm({ ...form, knowledgeBases: options });
                }}
                className="w-full px-3 py-2 bg-cyber-dark border border-white/10 rounded-xl text-white text-sm focus:border-cyber-purple outline-none"
              >
                {kbs.map(kb => (
                  <option key={kb._id} value={kb._id}>{kb.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sandbox Testing Console */}
      <div className="glass-card rounded-2xl border-white/15 flex flex-col h-full overflow-hidden relative">
        <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-sm text-white tracking-wide uppercase flex items-center gap-1.5">
            <Terminal size={14} className="text-cyber-cyan" /> Sandbox Testing
          </span>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          {messages.map((m, idx) => (
            <div key={idx} className={`p-3 rounded-xl border max-w-[85%] ${
              m.sender === 'user' 
                ? 'bg-cyber-purple/20 border-cyber-purple/30 ml-auto text-white' 
                : 'bg-white/5 border-white/10 text-white/80'
            }`}>
              <div className="font-bold text-[10px] text-cyber-cyan mb-1 uppercase tracking-wider">{m.senderName}</div>
              <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          ))}
          {chatLoading && (
            <div className="flex items-center gap-2 text-white/40">
              <RefreshCw size={12} className="animate-spin text-cyber-cyan" />
              <span>Agent is reasoning...</span>
            </div>
          )}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex gap-2 shrink-0 bg-cyber-dark">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type code or query tests..." 
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-cyber-purple font-mono"
          />
          <button 
            type="submit"
            className="p-2.5 rounded-xl bg-cyber-purple text-white hover:opacity-90 transition-opacity"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
