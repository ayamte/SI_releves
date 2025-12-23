import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import logger from './config/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.json({
    status: 'OK',
    message: 'SI Relevés API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import compteurRoutes from './routes/compteur.routes.js';
import releveRoutes from './routes/releve.routes.js';
import debugRoutes from './routes/debug.js';

app.use('/api/debug', debugRoutes);


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/compteurs', compteurRoutes);
app.use('/api/releves', releveRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({
    success: false,
    message: 'Une erreur serveur est survenue',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    logger.info('Database connection established successfully');

    // Sync models (in development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
      logger.info('Database models synchronized');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`Server started on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'staging'
      });
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    logger.error('Unable to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();

export default app;
