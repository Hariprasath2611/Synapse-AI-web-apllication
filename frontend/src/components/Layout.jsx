import React, { useState } from 'react';
import { 
  Home, Cpu, ShoppingBag, Database, GitFork, MessageSquare, 
  DollarSign, BarChart2, Users, ShieldAlert, Settings, Bell, Menu, X, ChevronDown 
} from 'lucide-react';

export default function Layout({ children, currentTab, setCurrentTab, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home, roles: ['Admin', 'Creator', 'Business', 'User'] },
    { id: 'builder', label: 'Agent Builder', icon: Cpu, roles: ['Admin', 'Creator', 'Business'] },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['Admin', 'Creator', 'Business', 'User'] },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database, roles: ['Admin', 'Creator', 'Business'] },
    { id: 'workflow', label: 'Workflows', icon: GitFork, roles: ['Admin', 'Creator', 'Business'] },
    { id: 'conversations', label: 'Chat Arena', icon: MessageSquare, roles: ['Admin', 'Creator', 'Business', 'User'] },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, roles: ['Admin', 'Creator'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, roles: ['Admin', 'Creator', 'Business'] },
    { id: 'teams', label: 'Team Space', icon: Users, roles: ['Admin', 'Creator', 'Business'] },
    { id: 'admin', label: 'Admin Panel', icon: ShieldAlert, roles: ['Admin'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Creator', 'Business', 'User'] }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role || 'User'));

  const notifications = [
    { id: 1, title: 'Revenue Dispatched', time: '2h ago', body: '$420.00 was transferred to Stripe.' },
    { id: 2, title: 'Workflow Executed', time: '4h ago', body: 'Lead Pipeline completed 100% successfully.' }
  ];

  return (
    <div className="min-h-screen bg-cyber-dark text-cyber-text flex relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-card border-r border-white/10 shrink-0 sticky top-0 h-screen z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyber-purple to-cyber-cyan flex items-center justify-center font-bold text-white text-base">
            🧬
          </div>
          <div>
            <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-white to-cyber-cyan bg-clip-text text-transparent">
              SYNAPSE AI
            </span>
          </div>
        </div>

        {/* User Meta Card */}
        <div className="p-4 mx-3 my-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyber-purple/30 border border-cyber-cyan/30 flex items-center justify-center font-bold text-cyber-cyan">
            {user.name ? user.name[0] : 'U'}
          </div>
          <div className="overflow-hidden">
            <span className="block font-semibold text-sm truncate">{user.name}</span>
            <span className="block text-xs text-cyber-cyan font-mono uppercase tracking-wider">{user.role}</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active 
                    ? 'bg-cyber-purple text-white shadow-lg shadow-cyber-purple/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={active ? 'text-cyber-cyan' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout Bottom */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full py-2 px-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden">
          <div className="w-64 h-full bg-cyber-dark border-r border-white/10 flex flex-col p-6 animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg text-white">SYNAPSE MENU</span>
              <button onClick={() => setMobileOpen(false)}><X size={20} /></button>
            </div>
            <nav className="flex-1 space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active 
                        ? 'bg-cyber-purple text-white' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-15 bg-cyber-dark/80 backdrop-blur-md border-b border-white/15 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-white capitalize">
              {menuItems.find(i => i.id === currentTab)?.label || 'Workspace'}
            </h2>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Project Switcher */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium cursor-pointer">
              <span>organization_alpha</span>
              <ChevronDown size={14} />
            </div>

            {/* Notification trigger */}
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 glass-card rounded-xl shadow-2xl p-4 border border-white/15 z-30">
                <h4 className="font-bold text-sm mb-3">Recent Notifications</h4>
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div key={n.id} className="pb-2 border-b border-white/5 last:border-0 last:pb-0 text-xs">
                      <div className="flex justify-between font-semibold text-white mb-1">
                        <span>{n.title}</span>
                        <span className="text-white/40">{n.time}</span>
                      </div>
                      <p className="text-white/60">{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Subpage Scroll Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
