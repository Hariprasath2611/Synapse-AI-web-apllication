import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { GitFork, Plus, Play, Trash2, CheckCircle, RefreshCw, Terminal, Code, ArrowRight } from 'lucide-react';

export default function WorkflowBuilder() {
  const [nodes, setNodes] = useState([
    { id: 'trigger-1', type: 'trigger', label: 'Lead Generated (Webhook)', desc: 'Fires when webhook matches payload config.' },
    { id: 'agent-2', type: 'agent', label: 'AI Lead Classifier', desc: 'Runs Gemini intelligence scoring.' },
    { id: 'crm-3', type: 'crm', label: 'Update HubSpot CRM', desc: 'Pushes metadata to lead lists.' },
    { id: 'email-4', type: 'email', label: 'Send Welcome Email', desc: 'Dispatches introductory email templates.' }
  ]);
  const [executing, setExecuting] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Setup Socket connection for real-time progress callbacks
    const s = io('http://localhost:5000');
    setSocket(s);

    s.on('workflow_progress', (data) => {
      setActiveNodeId(data.nodeId);
      
      const logMsg = `[${data.status.toUpperCase()}] ${data.nodeId}: ${data.output}`;
      setTerminalLogs(prev => [...prev, logMsg]);

      if (data.status === 'completed' && data.nodeId === 'email-4') {
        setExecuting(false);
        setActiveNodeId(null);
        setTerminalLogs(prev => [...prev, "WORKFLOW COMPLETED SUCCESSFULLY."]);
      }
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleAddNode = (type) => {
    const labels = {
      agent: 'AI Custom Agent',
      email: 'Send Alert Email',
      crm: 'Update CRM Records',
      webhook: 'Trigger API Webhook',
      notification: 'Disptach Slack Message'
    };
    
    const descs = {
      agent: 'Executes reasoning prompt.',
      email: 'Sends alert notifications.',
      crm: 'Writes data objects to client CRM.',
      webhook: 'Dispatches raw REST body requests.',
      notification: 'Triggers active webhook integrations.'
    };

    const newId = `${type}-${Date.now()}`;
    setNodes(prev => [...prev, {
      id: newId,
      type,
      label: labels[type] || 'New Node',
      desc: descs[type] || 'Automation step.'
    }]);
  };

  const handleDeleteNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleExecute = async () => {
    setExecuting(true);
    setTerminalLogs(["INITIATING GRAPH AUTOMATION EXECUTION RUN..."]);
    
    try {
      // Trigger execution endpoint
      await fetch('/api/workflows/w1/execute', { method: 'POST' });
    } catch (err) {
      console.error(err);
      setExecuting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)] animate-fade-in">
      {/* Toolbox - Left */}
      <div className="glass-card p-5 rounded-2xl border-white/10 flex flex-col space-y-4 h-full shrink-0">
        <div>
          <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Drag-and-Drop Nodes</span>
          <h3 className="font-extrabold text-white text-base">Node Elements</h3>
        </div>

        <div className="space-y-2.5">
          {['agent', 'email', 'crm', 'webhook', 'notification'].map((type) => (
            <button
              key={type}
              onClick={() => handleAddNode(type)}
              className="w-full p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyber-cyan/40 text-xs font-semibold text-white/80 hover:text-white flex items-center justify-between transition-all"
            >
              <span className="capitalize">{type} Node</span>
              <Plus size={14} className="text-cyber-cyan" />
            </button>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4 mt-auto">
          <button
            onClick={handleExecute}
            disabled={executing || nodes.length === 0}
            className="w-full py-3 bg-gradient-to-r from-cyber-purple to-cyber-cyan text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyber-purple/20"
          >
            {executing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {executing ? 'Executing Flow...' : 'Execute Workflow'}
          </button>
        </div>
      </div>

      {/* Visual Workspace - Center */}
      <div className="lg:col-span-2 glass-card rounded-3xl border-white/15 relative overflow-hidden flex items-center justify-center bg-cyber-dark/40 p-6">
        <div className="absolute inset-0 animate-grid-fade opacity-30 pointer-events-none" />
        
        {/* Nodes Link Flow */}
        <div className="flex flex-col items-center gap-8 w-full max-w-sm overflow-y-auto max-h-full py-6 relative z-10">
          {nodes.map((node, index) => {
            const isActive = activeNodeId === node.id;
            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div className={`w-full p-4 rounded-2xl border transition-all relative group ${
                  isActive 
                    ? 'border-cyber-cyan bg-cyber-cyan/10 glow-cyan scale-105' 
                    : 'border-white/10 bg-[#111827]/75'
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-extrabold text-white text-xs">{node.label}</span>
                    <button 
                      onClick={() => handleDeleteNode(node.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded text-white/50 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40">{node.desc}</p>
                </div>

                {/* Arrow Connector */}
                {index < nodes.length - 1 && (
                  <div className="flex flex-col items-center">
                    <div className="w-[1.5px] h-6 bg-gradient-to-b from-cyber-purple to-cyber-cyan" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Execution logs - Right */}
      <div className="glass-card rounded-2xl border-white/10 flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2 shrink-0">
          <Terminal size={14} className="text-cyber-cyan" />
          <span className="font-extrabold text-xs text-white tracking-wider uppercase">Execution Console</span>
        </div>

        <div className="flex-1 p-4 bg-[#050811] overflow-y-auto space-y-2.5 text-[10px] font-mono text-emerald-400">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
          ))}
          {executing && (
            <div className="flex items-center gap-1.5 text-white/40">
              <RefreshCw size={10} className="animate-spin text-cyber-cyan" /> Running execution steps...
            </div>
          )}
          {terminalLogs.length === 0 && (
            <div className="text-center py-20 text-white/40">
              Click "Execute Workflow" to view step compile logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
