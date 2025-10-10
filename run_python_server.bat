@echo off
echo Starting Gemini AI Python Server...
REM TODO: Replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key
REM You can get your API key from: https://makersuite.google.com/app/apikey
set GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
python simple_server.py
pause
