# Dotify Frontend

This is the frontend-only deployment for Vercel.

## Backend Deployment

The AI backend is deployed separately on Railway. See `deploy_backend.md` for instructions.

## Frontend Features

- 🖼️ Image upload and analysis
- ⌨️ Manual text input
- 📱 Camera mode
- 🔗 Serial connection to Braille printer
- 🌙 Dark theme with modern UI

## Local Development

```bash
npm install
npm run dev
```

## Deployment

This frontend is automatically deployed to Vercel when you push to the main branch.

The backend files are ignored by Vercel (see `.vercelignore`) and should be deployed separately to Railway.
