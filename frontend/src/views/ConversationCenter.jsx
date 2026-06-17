import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu, Users, Play, Plus, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';

export default function ConversationCenter() {
  const [agents, setAgents] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);

  // Multi-agent selection
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [collabMode, setCollabMode] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const agentsRes = await fetch('/api/agents');
        const agentsData = await agentsRes.json();
        setAgents(agentsData);

        const convoRes = await fetch('/api/conversations');
        const convoData = await convoRes.json();
        setConversations(convoData);
        if (convoData.length > 0) {
          handleSelectConvo(convoData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSelectConvo = async (convo) => {
    setActiveConvo(convo);
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convo._id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConvo = async (name = 'New Chat', participantIds = []) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, participants: participantIds })
      });
      const data = await res.json();
      setConversations(prev => [data, ...prev]);
      setActiveConvo(data);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvo) return;

    const userText = inputText;
    setInputText('');

    const userMsg = {
      _id: `m-${Date.now()}`,
      sender: 'user',
      senderName: 'You',
      content: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // If in collaborative mode, dispatch to all selected agents in series
      if (collabMode && selectedAgents.length > 0) {
        for (const agentId of selectedAgents) {
          const agent = agents.find(a => a._id === agentId);
          if (!agent) continue;
          
          await fetch(`/api/conversations/${activeConvo._id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: 'user',
              senderName: 'You',
              content: `[Collaborating Node] ${userText}`,
              agentId: agent._id
            })
          });

          // Fetch updated logs
          const historyRes = await fetch(`/api/conversations/${activeConvo._id}/messages`);
          const historyData = await historyRes.json();
          setMessages(historyData);
          await new Promise(resolve => setTimeout(resolve, 800)); // gap
        }
      } else {
        // Standard single-agent route
        const activeAgentId = selectedAgents[0] || 'a1';
        await fetch(`/api/conversations/${activeConvo._id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'user',
            senderName: 'You',
            content: userText,
            agentId: activeAgentId
          })
        });

        const historyRes = await fetch(`/api/conversations/${activeConvo._id}/messages`);
        const historyData = await historyRes.json();
        setMessages(historyData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelectAgent = (agentId) => {
    if (collabMode) {
      setSelectedAgents(prev => 
        prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
      );
    } else {
      setSelectedAgents([agentId]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)] animate-fade-in">
      {/* Sidebar - Rooms List & Agent selectors */}
      <div className="glass-card rounded-2xl border-white/10 p-5 flex flex-col space-y-6 overflow-hidden h-full shrink-0">
        <div>
          <span className="text-[10px] text-cyber-cyan font-mono uppercase tracking-widest block mb-1">Collaboration channels</span>
          <h3 className="font-extrabold text-white text-base">Chat Channels</h3>
        </div>

        {/* Toggle Collab Mode */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs">
          <span className="font-bold text-white">Multi-Agent Collab</span>
          <button
            onClick={() => {
              setCollabMode(!collabMode);
              setSelectedAgents([]);
            }}
            className={`w-10 py-1 px-1.5 rounded-full flex transition-colors ${
              collabMode ? 'bg-cyber-cyan justify-end' : 'bg-white/10 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 bg-cyber-dark rounded-full" />
          </button>
        </div>

        {/* Agents Selection Grid */}
        <div className="space-y-2.5">
          <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">Select Reasoning Agents</span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {agents.map(a => {
              const active = selectedAgents.includes(a._id);
              return (
                <button
                  key={a._id}
                  onClick={() => toggleSelectAgent(a._id)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    active 
                      ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan' 
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <span className="truncate">{a.name}</span>
                  {active && <Sparkles size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start New Chat Button */}
        <button
          onClick={() => handleStartConvo(collabMode ? 'Multi-Agent Room' : 'Direct Conversation', selectedAgents)}
          className="w-full py-2.5 bg-cyber-purple hover:bg-cyber-purple/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Plus size={14} /> Create Channel
        </button>

        {/* Active Chats List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <span className="block text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">Open Rooms</span>
          <div className="space-y-1.5">
            {conversations.map(convo => {
              const active = activeConvo?._id === convo._id;
              return (
                <button
                  key={convo._id}
                  onClick={() => handleSelectConvo(convo)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                    active 
                      ? 'border-cyber-cyan bg-cyber-cyan/10 text-white' 
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="block truncate">{convo.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat window - Right */}
      <div className="lg:col-span-3 glass-card rounded-3xl border-white/15 flex flex-col h-full overflow-hidden">
        {/* Chat header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple">
              {collabMode ? <Users size={20} className="text-cyber-cyan" /> : <MessageSquare size={20} />}
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">{activeConvo?.name || 'Arena Select'}</h4>
              <span className="text-[10px] text-white/40">
                {collabMode ? `${selectedAgents.length} Agents Collaborating` : 'Gemini-Powered Engine'}
              </span>
            </div>
          </div>
        </div>

        {/* Message Streams */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div key={m._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] border ${
                  isMe 
                    ? 'bg-cyber-purple/20 border-cyber-purple/30 text-white' 
                    : 'bg-white/5 border-white/10 text-white/90'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-extrabold text-[10px] text-cyber-cyan uppercase tracking-wider">
                      {m.senderName || (isMe ? 'You' : 'Agent')}
                    </span>
                    {m.tokensUsed > 0 && (
                      <span className="text-[9px] text-white/30 font-mono">({m.tokensUsed} tokens)</span>
                    )}
                  </div>
                  <p className="text-xs font-mono leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 flex gap-3 bg-cyber-dark shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={collabMode ? "Dispatch prompt to agent swarm..." : "Type message response..."}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyber-purple font-mono"
            disabled={!activeConvo}
          />
          <button
            type="submit"
            disabled={!activeConvo || !inputText.trim()}
            className="px-5 py-3 bg-cyber-purple hover:bg-cyber-purple/90 text-white rounded-xl font-bold flex items-center justify-center transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
