#!/usr/bin/env python3
"""
Gemini AI Server for Braille Printer
Handles image analysis and text processing for accessibility
"""

import os
import json
import base64
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Configuration
PORT = int(os.environ.get('PORT', 8000))
API_KEY = os.environ.get('GEMINI_API_KEY', 'your-api-key-here')

# Configure Gemini AI
if API_KEY and API_KEY != 'your-api-key-here':
    genai.configure(api_key=API_KEY)
    print(f"🔑 Gemini API Key: Set")
else:
    print(f"🔑 Gemini API Key: Using default (set GEMINI_API_KEY env var)")

class GeminiHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/test':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "status": "success",
                "message": "Gemini AI Server is running",
                "api_key_configured": API_KEY and API_KEY != 'your-api-key-here',
                "timestamp": self.date_time_string()
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif parsed_path.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {"status": "healthy", "service": "gemini-ai-server"}
            self.wfile.write(json.dumps(response).encode())
            
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {"error": "Endpoint not found", "path": self.path}
            self.wfile.write(json.dumps(response).encode())

    def do_POST(self):
        """Handle POST requests for image analysis"""
        if self.path == '/api/analyze':
            self.handle_analyze()
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {"error": "Endpoint not found", "path": self.path}
            self.wfile.write(json.dumps(response).encode())

    def handle_analyze(self):
        """Handle image analysis requests"""
        try:
            # Set CORS headers
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            
            # Check API key
            if not API_KEY or API_KEY == 'your-api-key-here':
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {
                    "error": "GEMINI_API_KEY environment variable not set",
                    "message": "Please set the GEMINI_API_KEY environment variable"
                }
                self.wfile.write(json.dumps(response).encode())
                return

            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {"error": "Invalid JSON in request body"}
                self.wfile.write(json.dumps(response).encode())
                return

            # Extract image data
            image_data = data.get('image')
            if not image_data:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response = {"error": "No image data provided"}
                self.wfile.write(json.dumps(response).encode())
                return

            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]

            # Analyze image with Gemini
            analysis = self.analyze_image_with_gemini(image_data)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                "success": True,
                "analysis": analysis,
                "timestamp": self.date_time_string(),
                "model": "gemini-1.5-flash"
            }
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            print(f"Error in analyze endpoint: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                "error": "Internal server error",
                "message": str(e)
            }
            self.wfile.write(json.dumps(response).encode())

    def analyze_image_with_gemini(self, image_data):
        """Analyze image using Gemini AI"""
        try:
            # Initialize Gemini model
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Prepare image for Gemini
            image_bytes = base64.b64decode(image_data)
            
            # Create prompt for accessibility-focused analysis
            prompt = """
            Analyze this image and provide a detailed description suitable for a Braille printer. 
            Focus on:
            1. Text content (if any) - transcribe exactly
            2. Objects and their positions
            3. Colors and visual elements
            4. Overall scene composition
            5. Any important details for accessibility
            
            Keep the description concise but comprehensive, as it will be converted to Braille.
            """
            
            # Generate content
            response = model.generate_content(
                [prompt, {"mime_type": "image/jpeg", "data": image_bytes}],
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            
            return response.text
            
        except Exception as e:
            print(f"Error analyzing image with Gemini: {e}")
            return f"Error analyzing image: {str(e)}"

    def log_message(self, format, *args):
        """Override to reduce log noise"""
        pass

def run_server(port):
    """Start the server"""
    try:
        with socketserver.TCPServer(("", port), GeminiHandler) as httpd:
            print(f"🚀 Starting Python server on http://localhost:{port}")
            print(f"📱 Open http://localhost:{port} in your browser")
            print("Press Ctrl+C to stop the server")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use. Try a different port.")
        else:
            print(f"❌ Error starting server: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    run_server(PORT)
