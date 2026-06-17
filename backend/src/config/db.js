import mongoose from 'mongoose';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// A local mock database in case MongoDB is unavailable
class MockDatabase {
  constructor() {
    this.dbPath = path.resolve('mock_db.json');
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({
        users: [],
        agents: [],
        workflows: [],
        conversations: [],
        messages: [],
        knowledgeBases: [],
        payments: [],
        marketplaceListings: [],
        notifications: [],
        analytics: []
      }, null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      logger.error('Failed to read mock db:', err);
      return {};
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    } catch (err) {
      logger.error('Failed to write mock db:', err);
    }
  }

  getCollection(collectionName) {
    const db = this.read();
    return db[collectionName] || [];
  }

  saveToCollection(collectionName, item) {
    const db = this.read();
    if (!db[collectionName]) db[collectionName] = [];
    
    const index = db[collectionName].findIndex(x => x.id === item.id || x._id === item._id);
    if (index !== -1) {
      db[collectionName][index] = { ...db[collectionName][index], ...item };
    } else {
      if (!item.id && !item._id) {
        item._id = Math.random().toString(36).substring(2, 9);
      }
      db[collectionName].push(item);
    }
    this.write(db);
    return item;
  }

  deleteFromCollection(collectionName, id) {
    const db = this.read();
    if (!db[collectionName]) return;
    db[collectionName] = db[collectionName].filter(x => x.id !== id && x._id !== id);
    this.write(db);
  }
}

export const mockDb = new MockDatabase();
export let isUsingMock = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes('your_gemini_api_key_here') || mongoUri.includes('<user>')) {
    logger.warn('MONGO_URI not configured. Switched to JSON-based File Sandbox Database.');
    isUsingMock = true;
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB Atlas successfully connected.');
  } catch (error) {
    logger.error(`MongoDB Atlas connection error: ${error.message}. Falling back to Local Sandbox DB.`);
    isUsingMock = true;
  }
};
