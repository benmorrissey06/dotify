// Vercel serverless function for testing
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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    return res.status(200).json({
      status: 'success',
      message: 'Vercel AI Server is running',
      api_key_configured: !!apiKey,
      timestamp: new Date().toISOString(),
      platform: 'Vercel Serverless Functions'
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
