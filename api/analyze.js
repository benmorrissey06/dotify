const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get API key from environment variable
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ 
                error: 'GEMINI_API_KEY environment variable not set' 
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

        // Create prompt for image analysis
        const prompt = "Analyze this image and provide a detailed description of what you see. Include any text, objects, people, colors, and overall scene composition.";

        // Generate content using Gemini
        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const analysis = response.text();

        // Return the analysis
        res.status(200).json({
            success: true,
            analysis: analysis,
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
};
