import { GoogleGenerativeAI } from '@google/generative-ai';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  logger.info('Gemini Generative AI client initialized.');
} else {
  logger.warn('GEMINI_API_KEY not provided. Switched to Simulated LLM responses.');
}

const DEFAULT_MOCK_RESPONSES = {
  coding: [
    "```javascript\n// Optimized function written by Synapse Code Agent\nexport function calculateAnalytics(data) {\n  return data.reduce((acc, curr) => {\n    acc[curr.type] = (acc[curr.type] || 0) + curr.value;\n    return acc;\n  }, {});\n}\n```\nHere is your code! I've set up a linear-time reduction accumulator to count analytics metrics.",
    "I've analyzed the repository files. The bug is caused by a missing null check on the session user object. I suggest wrapping the function body with `if (!user) return null;`"
  ],
  business: [
    "Based on current market forecasts, your AI SaaS can target a premium tier priced at $49/mo. By attracting 500 subscribers, your Monthly Recurring Revenue (MRR) will reach $24,500 with a profit margin of 85%.",
    "Let's design a go-to-market strategy. We should focus on LinkedIn organic posts detailing agent builder workflows, combined with a Product Hunt launch scheduled for next Tuesday."
  ],
  research: [
    "Here is a summary of the latest publications on Multi-Agent architectures:\n1. LangGraph models loops as state transition graphs.\n2. AutoGen focuses on conversation patterns between multiple subagents.\n3. Synapse AI integrates these principles to support zero-code visual builders.",
    "According to the documentation, vector indexing is optimal when chunks have an overlap of 10-15%. This preserves contextual relevance during semantic retrieval."
  ],
  chat: [
    "Hello there! I am Synapse AI Agent. I can help you compile databases, build custom widgets, or deploy automated workflows.",
    "That is a great idea. I recommend starting with a simple visual trigger node connected to a classification agent."
  ]
};

export const generateAgentResponse = async (agent, messages) => {
  const prompt = messages[messages.length - 1].content;
  const personality = agent.personality || 'chat';
  const systemInstruction = `You are a custom AI agent named "${agent.name}".
Your personality: ${agent.description || 'Helpful AI companion'}.
Your goals: ${agent.goals || 'Assist the user and complete tasks'}.
Agent Category: ${agent.category || 'General'}.`;

  if (!genAI) {
    // Return mock response based on category/personality
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate thinking latency
    const categoryKey = ['coding', 'business', 'research'].includes(personality.toLowerCase()) 
      ? personality.toLowerCase() 
      : 'chat';
    
    const mocks = DEFAULT_MOCK_RESPONSES[categoryKey];
    const randomIndex = Math.floor(Math.random() * mocks.length);
    return {
      content: `[Simulated Response] ${mocks[randomIndex]}`,
      model: 'gemini-1.5-flash-simulated',
      tokensUsed: Math.floor(Math.random() * 200) + 100
    };
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2048,
      }
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return {
      content: response.text(),
      model: 'gemini-1.5-flash',
      tokensUsed: response.usageMetadata ? response.usageMetadata.totalTokenCount : 0
    };
  } catch (error) {
    logger.error('Gemini API call failed:', error);
    throw new Error(`AI generation failed: ${error.message}`);
  }
};
