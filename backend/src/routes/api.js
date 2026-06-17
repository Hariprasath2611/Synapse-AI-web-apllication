import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { isUsingMock, mockDb } from '../config/db.js';
import * as models from '../models/schemas.js';
import { generateAgentResponse } from '../services/geminiService.js';
import { createCheckoutSession } from '../services/paymentService.js';
import { indexDocumentChunks, queryVectorDatabase } from '../services/vectorService.js';
import { executeWorkflow } from '../services/workflowService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_synapse_jwt_key_9988';

// --- MIDDLEWARE FOR AUTHENTICATION ---
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If testing/mocking, auto-authenticate to ease workspace setup
    req.user = { id: 'mock-user-123', email: 'creator@synapse.ai', role: 'Creator', name: 'Hariprasath' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = { id: 'mock-user-123', email: 'creator@synapse.ai', role: 'Creator', name: 'Hariprasath' };
      return next();
    }
    req.user = user;
    next();
  });
};

// --- AUTH ROUTER (/api/auth) ---
router.post('/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  const passwordHash = await bcryptjs.hash(password || 'password123', 10);
  const userPayload = {
    _id: uuidv4(),
    email: email || 'creator@synapse.ai',
    name: name || 'Hariprasath',
    role: role || 'Creator',
    passwordHash,
    subscriptionStatus: 'free',
    createdAt: new Date()
  };

  if (isUsingMock) {
    mockDb.saveToCollection('users', userPayload);
    const token = jwt.sign({ id: userPayload._id, email: userPayload.email, role: userPayload.role, name: userPayload.name }, JWT_SECRET);
    return res.status(201).json({ token, user: userPayload });
  } else {
    try {
      const newUser = new models.User({ email: userPayload.email, name: userPayload.name, role: userPayload.role });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET);
      return res.status(201).json({ token, user: newUser });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
});

router.post('/auth/login', async (req, res) => {
  const { email } = req.body;
  const userEmail = email || 'creator@synapse.ai';

  if (isUsingMock) {
    const users = mockDb.getCollection('users');
    let user = users.find(u => u.email === userEmail);
    if (!user) {
      user = {
        _id: 'mock-user-123',
        email: userEmail,
        name: 'Hariprasath',
        role: 'Creator',
        subscriptionStatus: 'free',
        createdAt: new Date()
      };
      mockDb.saveToCollection('users', user);
    }
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
    return res.json({ token, user });
  } else {
    try {
      let user = await models.User.findOne({ email: userEmail });
      if (!user) {
        user = new models.User({ email: userEmail, name: 'Hariprasath', role: 'Creator' });
        await user.save();
      }
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
      return res.json({ token, user });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
});

router.get('/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- USERS ROUTER (/api/users) ---
router.get('/users/profile', authenticateToken, async (req, res) => {
  res.json({ profile: req.user });
});

// --- AGENTS ROUTER (/api/agents) ---
router.get('/agents', authenticateToken, async (req, res) => {
  if (isUsingMock) {
    const agents = mockDb.getCollection('agents');
    // If empty, preload some default agents
    if (agents.length === 0) {
      const defaultAgents = [
        { _id: 'a1', name: 'Synapse Coder', description: 'Expert coding assistant writing Javascript & Python.', goals: 'Write clean code and solve algorithms.', personality: 'Coding', category: 'Coding', price: 19, billingType: 'subscription', creatorId: 'mock-user-123', isPublished: true, rating: 4.8, reviewsCount: 12, tools: ['Web Scraper', 'Code Executor'], memoryType: 'short-term', createdAt: new Date() },
        { _id: 'a2', name: 'Startup Advisor', description: 'Gives strategic GTM and financial planning suggestions.', goals: 'Advise startups on revenue metrics.', personality: 'Business', category: 'Business', price: 0, billingType: 'free', creatorId: 'mock-user-123', isPublished: true, rating: 4.6, reviewsCount: 8, tools: ['Google Search'], memoryType: 'long-term', createdAt: new Date() },
        { _id: 'a3', name: 'RAG Researcher', description: 'Performs semantic document parsing and analysis.', goals: 'Extract details from loaded reports.', personality: 'Research', category: 'Research', price: 49, billingType: 'one-time', creatorId: 'mock-user-123', isPublished: true, rating: 4.9, reviewsCount: 15, tools: ['PDF Parser', 'Vector DB Search'], memoryType: 'long-term', createdAt: new Date() }
      ];
      defaultAgents.forEach(a => mockDb.saveToCollection('agents', a));
      return res.json(defaultAgents);
    }
    return res.json(agents);
  } else {
    try {
      const agents = await models.Agent.find();
      return res.json(agents);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
});

router.post('/agents', authenticateToken, async (req, res) => {
  const agentData = {
    ...req.body,
    _id: uuidv4(),
    creatorId: req.user.id || 'mock-user-123',
    rating: 4.5,
    reviewsCount: 0,
    createdAt: new Date()
  };

  if (isUsingMock) {
    mockDb.saveToCollection('agents', agentData);
    return res.status(201).json(agentData);
  } else {
    try {
      const newAgent = new models.Agent(agentData);
      await newAgent.save();
      return res.status(201).json(newAgent);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
});

router.put('/agents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (isUsingMock) {
    const agents = mockDb.getCollection('agents');
    const agent = agents.find(a => a._id === id || a.id === id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    const updated = { ...agent, ...req.body };
    mockDb.saveToCollection('agents', updated);
    return res.json(updated);
  } else {
    try {
      const updated = await models.Agent.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'Agent not found' });
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
});

router.delete('/agents/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (isUsingMock) {
    mockDb.deleteFromCollection('agents', id);
    return res.json({ success: true });
  } else {
    try {
      await models.Agent.findByIdAndDelete(id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
});

// --- KNOWLEDGE BASE ROUTER (/api/knowledge) ---
router.get('/knowledge', authenticateToken, async (req, res) => {
  if (isUsingMock) {
    const kbs = mockDb.getCollection('knowledgeBases');
    if (kbs.length === 0) {
      const defaults = [
        { _id: 'k1', name: 'Company Handbook', description: 'Internal policies and CRM keys.', creatorId: 'mock-user-123', documentsCount: 2, fileNames: ['handbook.pdf', 'keys.txt'], createdAt: new Date() },
        { _id: 'k2', name: 'Product FAQ Scrapes', description: 'FAQ scrapes from marketing site.', creatorId: 'mock-user-123', documentsCount: 1, fileNames: ['faq.csv'], createdAt: new Date() }
      ];
      defaults.forEach(d => mockDb.saveToCollection('knowledgeBases', d));
      return res.json(defaults);
    }
    return res.json(kbs);
  } else {
    try {
      const kbs = await models.KnowledgeBase.find({ creatorId: req.user.id });
      return res.json(kbs);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
});

router.post('/knowledge', authenticateToken, async (req, res) => {
  const kbData = {
    ...req.body,
    _id: uuidv4(),
    creatorId: req.user.id || 'mock-user-123',
    documentsCount: req.body.fileNames ? req.body.fileNames.length : 0,
    createdAt: new Date()
  };

  if (isUsingMock) {
    mockDb.saveToCollection('knowledgeBases', kbData);
    if (req.body.textContent) {
      await indexDocumentChunks(kbData._id, req.body.textContent);
    }
    return res.status(201).json(kbData);
  } else {
    try {
      const newKb = new models.KnowledgeBase(kbData);
      await newKb.save();
      if (req.body.textContent) {
        await indexDocumentChunks(newKb._id, req.body.textContent);
      }
      return res.status(201).json(newKb);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
});

router.post('/knowledge/search', authenticateToken, async (req, res) => {
  const { query } = req.body;
  const matches = await queryVectorDatabase(query || '');
  res.json({ results: matches });
});

// --- WORKFLOWS ROUTER (/api/workflows) ---
router.get('/workflows', authenticateToken, async (req, res) => {
  if (isUsingMock) {
    const flows = mockDb.getCollection('workflows');
    if (flows.length === 0) {
      const defaultFlow = {
        _id: 'w1',
        name: 'Lead Pipeline Automation',
        description: 'Qualifies incoming leads and sends HubSpot updates.',
        creatorId: 'mock-user-123',
        isActive: true,
        nodes: [
          { id: 'trigger-1', type: 'trigger', data: { label: 'Lead Generated (Webhook)' }, position: { x: 50, y: 150 } },
          { id: 'agent-2', type: 'agent', data: { label: 'AI Lead Classifier' }, position: { x: 250, y: 150 } },
          { id: 'crm-3', type: 'crm', data: { label: 'Update HubSpot CRM' }, position: { x: 450, y: 150 } },
          { id: 'email-4', type: 'email', data: { label: 'Send Welcome Email' }, position: { x: 650, y: 150 } }
        ],
        edges: [
          { id: 'e1-2', source: 'trigger-1', target: 'agent-2' },
          { id: 'e2-3', source: 'agent-2', target: 'crm-3' },
          { id: 'e3-4', source: 'crm-3', target: 'email-4' }
        ],
        createdAt: new Date()
      };
      mockDb.saveToCollection('workflows', defaultFlow);
      return res.json([defaultFlow]);
    }
    return res.json(flows);
  } else {
    try {
      const workflows = await models.Workflow.find({ creatorId: req.user.id });
      return res.json(workflows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
});

router.post('/workflows', authenticateToken, async (req, res) => {
  const flowData = {
    ...req.body,
    _id: uuidv4(),
    creatorId: req.user.id || 'mock-user-123',
    createdAt: new Date()
  };

  if (isUsingMock) {
    mockDb.saveToCollection('workflows', flowData);
    return res.status(201).json(flowData);
  } else {
    try {
      const newFlow = new models.Workflow(flowData);
      await newFlow.save();
      return res.status(201).json(newFlow);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
});

router.post('/workflows/:id/execute', authenticateToken, async (req, res) => {
  const { id } = req.params;
  let workflow = null;

  if (isUsingMock) {
    const flows = mockDb.getCollection('workflows');
    workflow = flows.find(f => f._id === id || f.id === id);
  } else {
    workflow = await models.Workflow.findById(id);
  }

  if (!workflow) {
    return res.status(404).json({ error: 'Workflow not found.' });
  }

  const result = await executeWorkflow(workflow, req.app.get('socketio'));
  res.json({ execution: result });
});

// --- CONVERSATIONS & MESSAGES (/api/conversations) ---
router.get('/conversations', authenticateToken, async (req, res) => {
  if (isUsingMock) {
    return res.json(mockDb.getCollection('conversations'));
  } else {
    return res.json(await models.Conversation.find());
  }
});

router.post('/conversations', authenticateToken, async (req, res) => {
  const conversation = {
    _id: uuidv4(),
    name: req.body.name || 'AI Collaboration Room',
    participants: req.body.participants || [],
    createdAt: new Date()
  };

  if (isUsingMock) {
    mockDb.saveToCollection('conversations', conversation);
    return res.status(201).json(conversation);
  } else {
    const newConvo = new models.Conversation(conversation);
    await newConvo.save();
    return res.status(201).json(newConvo);
  }
});

router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (isUsingMock) {
    const messages = mockDb.getCollection('messages').filter(m => m.conversationId === id);
    return res.json(messages);
  } else {
    const messages = await models.Message.find({ conversationId: id }).sort({ timestamp: 1 });
    return res.json(messages);
  }
});

router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { sender, senderName, content } = req.body;

  const userMsg = {
    _id: uuidv4(),
    conversationId: id,
    sender: sender || 'user',
    senderName: senderName || 'User',
    content,
    timestamp: new Date()
  };

  if (isUsingMock) {
    mockDb.saveToCollection('messages', userMsg);
  } else {
    const m = new models.Message(userMsg);
    await m.save();
  }

  // Socket broadcast
  const io = req.app.get('socketio');
  if (io) {
    io.to(id).emit('message_received', userMsg);
  }

  // Dynamic Agent Reply (if participant selected)
  const { agentId } = req.body;
  if (agentId) {
    try {
      let agent = null;
      if (isUsingMock) {
        agent = mockDb.getCollection('agents').find(a => a._id === agentId || a.id === agentId);
      } else {
        agent = await models.Agent.findById(agentId);
      }

      if (agent) {
        // Fetch full chat history
        let history = [];
        if (isUsingMock) {
          history = mockDb.getCollection('messages').filter(m => m.conversationId === id);
        } else {
          history = await models.Message.find({ conversationId: id }).sort({ timestamp: 1 });
        }

        const agentReply = await generateAgentResponse(agent, history);

        const agentMsg = {
          _id: uuidv4(),
          conversationId: id,
          sender: agent._id,
          senderName: agent.name,
          content: agentReply.content,
          tokensUsed: agentReply.tokensUsed,
          timestamp: new Date()
        };

        if (isUsingMock) {
          mockDb.saveToCollection('messages', agentMsg);
        } else {
          const m = new models.Message(agentMsg);
          await m.save();
        }

        if (io) {
          io.to(id).emit('message_received', agentMsg);
        }
      }
    } catch (err) {
      console.error('Agent response failed:', err);
    }
  }

  res.json(userMsg);
});

// --- MARKETPLACE ROUTER (/api/marketplace) ---
router.get('/marketplace', async (req, res) => {
  let agents = [];
  if (isUsingMock) {
    agents = mockDb.getCollection('agents').filter(a => a.isPublished);
  } else {
    agents = await models.Agent.find({ isPublished: true });
  }
  res.json(agents);
});

// --- PAYMENTS ROUTER (/api/payments) ---
router.post('/payments/checkout', authenticateToken, async (req, res) => {
  const { planId, amount, currency, gateway } = req.body;
  try {
    const session = await createCheckoutSession({
      planId: planId || 'pro',
      amount: amount || 29,
      currency: currency || 'usd',
      userId: req.user.id || 'mock-user-123',
      gateway: gateway || 'stripe'
    });
    
    // Save to payments ledger
    const ledger = {
      _id: uuidv4(),
      userId: req.user.id || 'mock-user-123',
      amount: amount || 29,
      currency: currency || 'usd',
      paymentId: session.id,
      status: 'pending',
      timestamp: new Date()
    };
    if (isUsingMock) {
      mockDb.saveToCollection('payments', ledger);
    } else {
      const tx = new models.Transaction(ledger);
      await tx.save();
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ANALYTICS ROUTER (/api/analytics) ---
router.get('/analytics', authenticateToken, (req, res) => {
  // Return system and creator dashboard statistics
  res.json({
    metrics: {
      dailyUsers: 1420,
      activeAgents: 42,
      revenue: 14820,
      retentionRate: 94.2,
      conversationsCount: 840,
      workflowExecutions: 245
    },
    revenueGrowth: [
      { month: 'Jan', earnings: 4000 },
      { month: 'Feb', earnings: 5500 },
      { month: 'Mar', earnings: 7800 },
      { month: 'Apr', earnings: 9200 },
      { month: 'May', earnings: 11400 },
      { month: 'Jun', earnings: 14820 }
    ],
    agentPerformance: [
      { name: 'Synapse Coder', conversations: 450, score: 98 },
      { name: 'Startup Advisor', conversations: 280, score: 92 },
      { name: 'RAG Researcher', conversations: 110, score: 99 }
    ]
  });
});

// --- ADMIN ROUTER (/api/admin) ---
router.get('/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'Admin' && req.user.role !== 'Creator') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({
    totalUsersCount: 2540,
    moderationQueueCount: 4,
    reportedAgentsCount: 0,
    serverUptime: '99.98%'
  });
});

// --- NOTIFICATIONS ROUTER (/api/notifications) ---
router.get('/notifications', authenticateToken, (req, res) => {
  const notifications = [
    { id: 'n1', title: 'Payout Dispatched', message: 'Your monthly creator revenue of $420.00 was sent to Stripe.', isRead: false, createdAt: new Date() },
    { id: 'n2', title: 'New Agent Subscriber', message: 'A business user subscribed to your agent "Synapse Coder".', isRead: false, createdAt: new Date() }
  ];
  res.json(notifications);
});

export default router;
