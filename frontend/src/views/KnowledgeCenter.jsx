import React, { useState, useEffect } from 'react';
import { Database, Search, Upload, Link2, Eye, RefreshCw, CheckCircle, FileText, ChevronRight } from 'lucide-react';

export default function KnowledgeCenter() {
  const [kbs, setKbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Scraper/Upload fields
  const [kbName, setKbName] = useState('Marketing Wiki');
  const [sourceUrl, setSourceUrl] = useState('https://synapse.ai/docs');
  const [textContent, setTextContent] = useState('Synapse AI resolves complex tasks using a Graph layout. We chunk data with a 50-token overlap to maintain relevance during cosine similarity vector matches.');

  // Vector Search test
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchKbs = async () => {
    try {
      const res = await fetch('/api/knowledge');
      const data = await res.json();
      setKbs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKbs();
  }, []);

  const handleCreateKb = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: kbName,
          description: `Synced document database from url scraper.`,
          fileNames: ['synced_docs.txt'],
          textContent: textContent
        })
      });
      if (res.ok) {
        setSuccess(true);
        setKbName('');
        setSourceUrl('');
        setTextContent('');
        fetchKbs();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleVectorSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);

    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in h-full">
      {/* Left Columns - KB Manager and Upload Form */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <span className="text-xs text-cyber-cyan font-mono uppercase tracking-wider">Sync unstructured data to Pinecone</span>
          <h1 className="text-2xl font-extrabold text-white">Knowledge Center</h1>
        </div>

        {/* Existing Knowledgebases */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Linked Vector Sources</h3>
          {loading ? (
            <div className="flex justify-center items-center py-6">
              <RefreshCw size={20} className="animate-spin text-cyber-cyan" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kbs.map(kb => (
                <div key={kb._id} className="glass-card p-5 rounded-2xl border-white/10 hover:border-cyber-cyan/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyber-purple/20 flex items-center justify-center text-cyber-purple">
                      <Database size={20} />
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
                      Pinecone Synced
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{kb.name}</h4>
                  <p className="text-white/50 text-[11px] mb-3">{kb.description || 'Vector storage node.'}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-cyber-cyan font-mono">
                    <FileText size={12} /> {kb.documentsCount || 1} Document File(s)
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Knowledgebase Form */}
        <div className="glass-card p-6 rounded-3xl border-white/15 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Upload size={16} className="text-cyber-cyan" /> Index New Data Source
          </h3>
          <form onSubmit={handleCreateKb} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 mb-1.5 font-medium">Source Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wiki Handbook"
                  value={kbName}
                  onChange={(e) => setKbName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyber-purple"
                  required
                />
              </div>
              <div>
                <label className="block text-white/50 mb-1.5 font-medium">Scrape Web URL (Optional)</label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://mysite.com/docs"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyber-purple"
                  />
                  <Link2 className="absolute left-3 top-3 text-white/40" size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/50 mb-1.5 font-medium">Document Content / Text Segment</label>
              <textarea
                rows={4}
                placeholder="Paste raw txt or manual markdown chunks here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-cyber-purple font-mono"
                required
              />
            </div>

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2">
                <CheckCircle size={16} /> Synced 100% to Vector Database.
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 bg-cyber-purple hover:bg-cyber-purple/90 text-white rounded-xl font-bold flex items-center gap-2"
            >
              {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
              {uploading ? 'Parsing and Syncing...' : 'Parse & Generate Embeddings'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column - Semantic Similarity Sandbox */}
      <div className="glass-card rounded-3xl p-6 border-white/15 flex flex-col h-full overflow-hidden">
        <div className="border-b border-white/10 pb-4 mb-4">
          <span className="block text-[10px] text-cyber-cyan font-mono uppercase tracking-widest mb-1">Vector DB Playground</span>
          <h3 className="font-bold text-white text-base">Semantic Search Test</h3>
        </div>

        <form onSubmit={handleVectorSearch} className="relative mb-6">
          <input
            type="text"
            placeholder="Type query to find nearest vectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyber-purple"
          />
          <Search className="absolute left-3.5 top-2.5 text-white/40" size={14} />
        </form>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {searchResults.map((result, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-cyber-cyan">
                <span>Chunk ID: {result.id.substring(0, 12)}...</span>
                <span>Score: {Math.round(result.score * 100)}%</span>
              </div>
              <p className="text-white/80 leading-relaxed font-mono text-[11px]">{result.text}</p>
            </div>
          ))}
          {searching && (
            <div className="flex justify-center py-6 text-white/40">
              <RefreshCw size={16} className="animate-spin text-cyber-cyan mr-2" /> Searching Pinecone...
            </div>
          )}
          {searchResults.length === 0 && !searching && (
            <div className="text-center py-12 text-white/40 font-mono text-[11px]">
              Perform a query above to verify cosine similarity scoring.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
