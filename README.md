# Dotify - AI to Braille Printer

An AI-powered Braille label printer that converts images or text into concise descriptions for accessibility.

## Features

- 🖼️ **Image Analysis**: Upload images for AI-powered description
- ⌨️ **Manual Input**: Type text directly for Braille conversion
- 📱 **Camera Mode**: Capture images directly from device camera
- 🔗 **Serial Connection**: Connect to Arduino Braille printer
- 🌙 **Dark Theme**: Modern, accessible interface
- 🤖 **Gemini AI**: Powered by Google's Gemini 1.5 Flash

## Frontend Deployment (Vercel)

The frontend is deployed on Vercel and works out of the box.

## Backend Deployment (Railway)

To enable AI functionality, deploy the Python backend:

### 1. Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `finaldotify` repository
5. Railway will auto-detect Python and deploy

### 2. Set Environment Variables

In Railway dashboard:
- Go to your project → Variables
- Add: `GEMINI_API_KEY` = `your_actual_gemini_api_key`

### 3. Get Your Backend URL

Railway will give you a URL like: `https://your-app.railway.app`

### 4. Update Frontend

Update the API URL in your frontend code to use your Railway URL instead of `localhost:8000`.

## Local Development

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
pip install -r requirements.txt
export GEMINI_API_KEY=your_api_key_here
python simple_server.py
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/analyze` - Analyze image (requires image data in JSON body)

## Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key
- `PORT` - Server port (default: 8000)

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Python, Google Generative AI
- **Deployment**: Vercel (frontend), Railway (backend)