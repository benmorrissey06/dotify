# Backend Deployment Guide

## Quick Deploy to Railway

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Copy the key

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `finaldotify` repository
   - Railway will auto-detect Python

3. **Set Environment Variable**
   - In Railway dashboard → Variables
   - Add: `GEMINI_API_KEY` = `your_actual_key`
   - Railway will restart automatically

4. **Get Your Backend URL**
   - Railway gives you a URL like: `https://your-app.railway.app`
   - Copy this URL

5. **Update Frontend (Optional)**
   - In `src/services/aiService.ts`
   - Change `http://localhost:8000` to your Railway URL
   - Push changes to GitHub
   - Vercel will auto-deploy the updated frontend

## Test Your Backend

Visit: `https://your-app.railway.app/api/test`

Should return:
```json
{
  "status": "success",
  "message": "Gemini AI Server is running",
  "api_key_configured": true,
  "timestamp": "..."
}
```

## Troubleshooting

- **API Key Error**: Make sure `GEMINI_API_KEY` is set in Railway variables
- **Build Fails**: Check that `requirements.txt` is in your repo
- **CORS Issues**: The server handles CORS automatically
