// Vercel serverless function for image analysis
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Check if API key is set
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY environment variable not set',
        message: 'Please set the GEMINI_API_KEY environment variable in Vercel'
      });
    }

    // Import Google Generative AI
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare image data
    let imageData;
    if (image.startsWith('data:image')) {
      imageData = image.split(',')[1];
    } else {
      imageData = image;
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData, 'base64');

    // Create prompt for accessibility-focused analysis
    const prompt = `
    Analyze this image and provide a detailed description suitable for a Braille printer. 
    Focus on:
    1. Text content (if any) - transcribe exactly
    2. Objects and their positions
    3. Colors and visual elements
    4. Overall scene composition
    5. Any important details for accessibility
    
    Keep the description concise but comprehensive, as it will be converted to Braille.
    `;

    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const analysis = response.text();

    return res.status(200).json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString(),
      model: 'gemini-1.5-flash'
    });

  } catch (error) {
    console.error('Error analyzing image:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
