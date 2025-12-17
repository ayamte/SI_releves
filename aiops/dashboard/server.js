const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const AIOPS_API_URL = process.env.AIOPS_API_URL || 'http://localhost:5000';
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json());

// Routes

app.get('/', async (req, res) => {
    try {
        const [anomaliesRes, recommendationsRes, statsRes] = await Promise.all([
            axios.get(`${AIOPS_API_URL}/api/anomalies`),
            axios.get(`${AIOPS_API_URL}/api/recommendations`),
            axios.get(`${AIOPS_API_URL}/api/stats`)
        ]);

        res.render('index', {
            anomalies: anomaliesRes.data.anomalies || [],
            recommendations: recommendationsRes.data.recommendations || [],
            stats: statsRes.data
        });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.render('index', {
            anomalies: [],
            recommendations: [],
            stats: { total_anomalies: 0, total_recommendations: 0, error_patterns_count: 0, top_errors: [] },
            error: 'Impossible de récupérer les données AIOps'
        });
    }
});

app.get('/api/anomalies', async (req, res) => {
    try {
        const response = await axios.get(`${AIOPS_API_URL}/api/anomalies`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/recommendations', async (req, res) => {
    try {
        const response = await axios.get(`${AIOPS_API_URL}/api/recommendations`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/analyze', async (req, res) => {
    try {
        const response = await axios.post(`${AIOPS_API_URL}/api/analyze`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'aiops-dashboard' });
});

app.listen(PORT, () => {
    console.log(`🤖 AIOps Dashboard running on http://localhost:${PORT}`);
    console.log(`📊 AIOps API: ${AIOPS_API_URL}`);
});
