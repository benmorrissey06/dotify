# Dotify Gemini AI API

A standalone Vercel deployment that provides image analysis using Google's Gemini AI Studio API.

## Features

- **Image Analysis**: Upload images and get detailed AI-powered descriptions
- **Multiple Test Methods**: Test with sample images or upload your own
- **Real-time Results**: See API responses and analysis results instantly
- **CORS Enabled**: Works from any domain
- **Environment Variable Configuration**: Secure API key management

## Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or use existing one
3. Generate an API key
4. Copy the API key

### 2. Deploy to Vercel

1. Fork or clone this repository
2. Connect to Vercel
3. Add environment variable:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key from step 1
4. Deploy

### 3. Usage

Once deployed, visit your Vercel URL to access the testing interface:

- **Test Simple API**: Basic connectivity test
- **Test Gemini AI Analysis**: Test without image (will show error)
- **Test with Sample Image**: Uses a built-in sample image
- **Upload Your Own Image**: Upload any image for analysis
- **Environment Check**: View current environment details

## API Endpoints

### `/api/test`
- **Method**: GET/POST
- **Purpose**: Basic connectivity test
- **Response**: Request details and timestamp

### `/api/analyze`
- **Method**: POST
- **Purpose**: Image analysis using Gemini AI
- **Body**: `{ "image": "base64_image_data" }`
- **Response**: AI analysis results

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

## Dependencies

- `@google/generative-ai`: Google's official Gemini AI SDK

## Development

```bash
npm install
vercel dev
```

## License

MIT
