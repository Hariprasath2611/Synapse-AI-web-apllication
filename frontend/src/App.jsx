import React, { useState } from 'react';
import LandingPage from './views/LandingPage.jsx';
import Layout from './components/Layout.jsx';
import DashboardOverview from './views/DashboardOverview.jsx';
import AgentBuilder from './views/AgentBuilder.jsx';
import Marketplace from './views/Marketplace.jsx';
import KnowledgeCenter from './views/KnowledgeCenter.jsx';
import WorkflowBuilder from './views/WorkflowBuilder.jsx';
import ConversationCenter from './views/ConversationCenter.jsx';
import { 
  AnalyticsDashboard, RevenueDashboard, TeamWorkspace, AdminPanel, Settings 
} from './views/ExtraDashboards.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  
  // Default mock user for local execution sandbox
  const [user, setUser] = useState({
    name: 'Hariprasath',
    email: 'creator@synapse.ai',
    role: 'Admin' // Admin has access to all pages including Admin Panel
  });

  const handleEnterApp = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTab('overview');
  };

  // Render correct page view based on active tab state
  const renderContent = () => {
    switch(currentTab) {
      case 'overview':
        return <DashboardOverview user={user} onNavigate={setCurrentTab} />;
      case 'builder':
        return <AgentBuilder />;
      case 'marketplace':
        return <Marketplace />;
      case 'knowledge':
        return <KnowledgeCenter />;
      case 'workflow':
        return <WorkflowBuilder />;
      case 'conversations':
        return <ConversationCenter />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'revenue':
        return <RevenueDashboard />;
      case 'teams':
        return <TeamWorkspace />;
      case 'admin':
        return <AdminPanel />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardOverview user={user} onNavigate={setCurrentTab} />;
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <Layout 
      currentTab={currentTab} 
      setCurrentTab={setCurrentTab} 
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}
