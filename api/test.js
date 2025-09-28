// Simple test API endpoint for debugging
module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Simple test response
    const testResponse = {
        message: 'API is working!',
        method: req.method,
        timestamp: new Date().toISOString(),
        headers: req.headers,
        body: req.body,
        query: req.query,
        url: req.url
    };

    res.status(200).json(testResponse);
};
