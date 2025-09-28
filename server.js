const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' })); // Increase payload limit for large images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('.'));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload Too Large',
            message: 'Image file is too large. Please try with a smaller image (max 50MB)',
            status: 413
        });
    }
    next(error);
});

// Test endpoint
app.get('/api/test', (req, res) => {
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
});

// Gemini AI analyze endpoint - GET for testing
app.get('/api/analyze', (req, res) => {
    res.status(200).json({
        message: 'Gemini AI Analyze endpoint is working!',
        method: 'GET',
        note: 'Use POST method with image data for analysis',
        example: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { image: 'base64_image_data' }
        },
        timestamp: new Date().toISOString()
    });
});

// Gemini AI analyze endpoint - POST for actual analysis
app.post('/api/analyze', async (req, res) => {
    try {
        // Get API key from environment variable
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'GEMINI_API_KEY environment variable not set',
                message: 'Please set your Gemini API key as an environment variable'
            });
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Get image from request body
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Prepare image data for Gemini
        const imageData = {
            inlineData: {
                data: image,
                mimeType: "image/jpeg"
            }
        };

        // Create prompt for Braille label analysis
        const prompt = `Analyze this image and create a 4-word Braille label description. Focus on:
1. Main object/subject (last word)
2. Key identifying features (brand, color, size, text)
3. Safety or functional details
4. Keep it concise and descriptive

Examples: "Large 2% milk carton", "White Advil medication bottle", "Room 237 door sign"

Return only the 4-word description.`;

        // Generate content using Gemini
        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const analysis = response.text();

        // Return the analysis
        res.status(200).json({
            success: true,
            analysis: analysis.trim(),
            timestamp: new Date().toISOString(),
            model: "gemini-1.5-flash"
        });

    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({
            error: 'Failed to analyze image',
            details: error.message
        });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Set' : 'Not set'}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
});