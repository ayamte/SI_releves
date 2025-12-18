import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';

const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  },
  index: 'si-releves-backend',
  indexPrefix: 'si-releves-backend',
  dataStream: false,
  transformer: (logData) => {
    return {
      '@timestamp': new Date().toISOString(),
      message: logData.message,
      level: logData.level,
      service: 'backend',
      environment: process.env.NODE_ENV || 'staging',
      meta: logData.meta,
    };
  },
};

// Create Elasticsearch transport
const esTransport = new ElasticsearchTransport(esTransportOpts);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'si-releves-backend' },
  transports: [
    // Console transport for local development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Elasticsearch transport for centralized logging
    esTransport,
  ],
});

// Handle Elasticsearch errors gracefully
esTransport.on('error', (error) => {
  console.error('Elasticsearch logging error:', error.message);
});

export default logger;
