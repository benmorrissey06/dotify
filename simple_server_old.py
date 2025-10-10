#!/usr/bin/env python3
"""
Simple Python server for Gemini AI API
No dependencies required - uses only built-in Python modules
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import base64
import os
from urllib.error import HTTPError

class GeminiHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        if self.path == '/api/analyze':
            self.handle_analyze()
        else:
            self.send_error(404, "Not Found")
    
    def do_GET(self):
        if self.path == '/api/test':
            self.handle_test()
        elif self.path == '/api/analyze':
            self.handle_analyze_info()
        elif self.path == '/':
            self.path = '/standalone.html'
            super().do_GET()
        else:
            super().do_GET()
    
    def handle_test(self):
        response = {
            "message": "API is working!",
            "method": "GET",
            "timestamp": self.date_time_string(),
            "server": "Python SimpleHTTPServer"
        }
        self.send_json_response(response)
    
    def handle_analyze_info(self):
        response = {
            "message": "Gemini AI Analyze endpoint is working!",
            "method": "GET",
            "note": "Use POST method with image data for analysis",
            "example": {
                "method": "POST",
                "headers": {"Content-Type": "application/json"},
                "body": {"image": "base64_image_data"}
            },
            "timestamp": self.date_time_string()
        }
        self.send_json_response(response)
    
    def handle_analyze(self):
        try:
            # Get API key from environment variable or use fallback placeholder
            # TODO: Replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key
            # You can get your API key from: https://makersuite.google.com/app/apikey
            api_key = os.environ.get('GEMINI_API_KEY') or "YOUR_GEMINI_API_KEY_HERE"
            
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error(400, "Invalid JSON")
                return
            
            image_data = data.get('image')
            if not image_data:
                self.send_error(400, "No image provided")
                return
            
            # Call Gemini API
            result = self.call_gemini_api(api_key, image_data)
            self.send_json_response(result)
            
        except Exception as e:
            error_response = {
                "error": "Failed to analyze image",
                "details": str(e)
            }
            self.send_error(500, json.dumps(error_response))
    
    def call_gemini_api(self, api_key, image_data):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": """ANALYSIS PROCESS:
1. Identify the main object/subject visually
2. Extract and read any visible text (labels, signs, writing, numbers)
3. Combine visual characteristics with key text information
4. Prioritize the most useful identifying details

PRIORITY FEATURES (include when visible):
- Text content (brand names, labels, numbers, words)
- Visual characteristics (size, color, shape, condition)
- Safety indicators (warnings, prescriptions, hazards)
- Functional details (buttons, switches, controls)
- Spatial markers (room numbers, addresses, directions)

FORMAT REQUIREMENTS:
- Maximum 4 words total
- Last word MUST be the main object/subject
- Include most distinguishing characteristic first
- Use specific descriptors over generic ones

EXAMPLES:
- Milk carton with "2%" text + large size → "Large 2% milk carton"
- Medicine bottle with "Advil" text + white color → "White Advil medication bottle"
- Door with "Room 237" sign → "Room 237 door sign"
- Control panel with "Power" button → "Red power button panel"
- Document with "Invoice" header → "Unpaid invoice document paper"
- Traffic sign with "Stop" text → "Red stop traffic sign"

SPATIAL CONTEXT (when multiple items visible):
- Include position: "Left", "Right", "Top", "Bottom"
- Example: "Blue Pepsi can left" (when next to other cans)

Return only the 4-word description, nothing else."""
                }, {
                    "inlineData": {
                        "data": image_data,
                        "mimeType": "image/jpeg"
                    }
                }]
            }]
        }
        
        data = json.dumps(request_body).encode('utf-8')
        
        req = urllib.request.Request(url, data=data)
        req.add_header('Content-Type', 'application/json')
        
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                
                if 'candidates' in result and result['candidates'] and 'content' in result['candidates'][0]:
                    analysis = result['candidates'][0]['content']['parts'][0]['text']
                    return {
                        "success": True,
                        "analysis": analysis.strip(),
                        "timestamp": self.date_time_string(),
                        "model": "gemini-2.5-flash"
                    }
                else:
                    return {
                        "error": "Unexpected response format",
                        "details": result
                    }
        except HTTPError as e:
            error_body = e.read().decode('utf-8')
            return {
                "error": f"Gemini API error: {e.code}",
                "details": error_body
            }
    
    def send_json_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode('utf-8'))

def run_server(port=8000):
    print(f"🚀 Starting Python server on http://localhost:{port}")
    print(f"🔑 Gemini API Key: {'Set' if os.environ.get('GEMINI_API_KEY') else 'Not set'}")
    print(f"📱 Open http://localhost:{port} in your browser")
    print("Press Ctrl+C to stop the server")
    
    with socketserver.TCPServer(("", port), GeminiHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)