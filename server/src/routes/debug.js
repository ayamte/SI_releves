import express from 'express';

const router = express.Router();

/**
 * @desc    Generate mock logs for testing ELK & AIOps
 * @route   GET /api/debug/mock-logs
 * @access  Public (NO AUTH)
 */
router.get('/mock-logs', (req, res) => {

    const baseLog = {
        service: 'backend',
        environment: 'staging'
    };

    console.log(JSON.stringify({
        ...baseLog,
        level: 'info',
        message: 'MOCK LOG | INFO | Local test started',
        timestamp: new Date().toISOString()
    }));

    console.log(JSON.stringify({
        ...baseLog,
        level: 'warn',
        message: 'MOCK LOG | WARN | High memory usage detected',
        timestamp: new Date().toISOString()
    }));

    console.log(JSON.stringify({
        ...baseLog,
        level: 'error',
        message: 'MOCK LOG | ERROR | Database connection failed',
        timestamp: new Date().toISOString()
    }));

    console.log(JSON.stringify({
        ...baseLog,
        level: 'error',
        message: 'MOCK LOG | ERROR | Database connection failed',
        timestamp: new Date().toISOString()
    }));

    console.log(JSON.stringify({
        ...baseLog,
        level: 'error',
        message: 'MOCK LOG | ERROR | Database connection failed',
        timestamp: new Date().toISOString()
    }));

    res.status(200).json({
        success: true,
        message: 'Mock logs generated successfully'
    });
});

export default router;
