import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Creator', 'Business', 'User'], default: 'User' },
  organization: { type: String, default: 'Personal Workspace' },
  apiKey: { type: String },
  stripeCustomerId: { type: String },
  subscriptionStatus: { type: String, default: 'free' },
  createdAt: { type: Date, default: Date.now }
});

// Agent Schema
const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  goals: { type: String },
  personality: { type: String, default: 'chat' },
  category: { type: String, default: 'General' },
  creatorId: { type: String, required: true },
  price: { type: Number, default: 0 },
  billingType: { type: String, enum: ['free', 'one-time', 'subscription'], default: 'free' },
  isPublished: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  tools: { type: [String], default: [] },
  memoryType: { type: String, default: 'short-term' },
  knowledgeBases: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

// Workflow Schema
const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  nodes: { type: Array, default: [] },
  edges: { type: Array, default: [] },
  creatorId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Conversation Schema
const ConversationSchema = new mongoose.Schema({
  participants: { type: [String], default: [] }, // Agent IDs or User ID
  name: { type: String, default: 'Multi-Agent Room' },
  createdAt: { type: Date, default: Date.now }
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  sender: { type: String, required: true }, // 'user' or agent ID
  senderName: { type: String },
  content: { type: String, required: true },
  tokensUsed: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

// KnowledgeBase Schema
const KnowledgeBaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creatorId: { type: String, required: true },
  documentsCount: { type: Number, default: 0 },
  fileNames: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

// Payments & Subscriptions
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  planId: { type: String, required: true },
  status: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
});

const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  paymentId: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Analytics
const AnalyticsSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
export const Agent = mongoose.model('Agent', AgentSchema);
export const Workflow = mongoose.model('Workflow', WorkflowSchema);
export const Conversation = mongoose.model('Conversation', ConversationSchema);
export const Message = mongoose.model('Message', MessageSchema);
export const KnowledgeBase = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
export const Subscription = mongoose.model('Subscription', SubscriptionSchema);
export const Transaction = mongoose.model('Transaction', TransactionSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const Analytics = mongoose.model('Analytics', AnalyticsSchema);
