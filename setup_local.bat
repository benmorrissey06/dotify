@echo off
echo 🐍 Setting up Python environment for local development...

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip to avoid warnings
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt --quiet

REM Set API key (replace with your actual key)
echo 🔑 Setting up environment...
set GEMINI_API_KEY=your-api-key-here

REM Run the server
echo 🚀 Starting server...
python simple_server.py

pause
