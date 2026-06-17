import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import winston from 'winston';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

const app = express();
const server = http.createServer(app);

// Socket.io integration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('socketio', io);

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Rate Limiting to prevent denial of service attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Mount combined API routes
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Socket connection handlers
io.on('connection', (socket) => {
  logger.info(`Socket client connected: ${socket.id}`);

  // Join a specific conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    logger.info(`Socket client ${socket.id} joined conversation room: ${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    logger.info(`Socket client ${socket.id} left conversation room: ${conversationId}`);
  });

  // Typing state updates
  socket.on('typing', ({ conversationId, senderName, isTyping }) => {
    socket.to(conversationId).emit('typing_status', { senderName, isTyping });
  });

  socket.on('disconnect', () => {
    logger.info(`Socket client disconnected: ${socket.id}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Error encountered: ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    logger.info(`Synapse AI API gateway server listening on port ${PORT}`);
  });
};

startServer();
