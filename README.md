# Dotify ⠙⠕⠞⠊⠋⠽ - AI-Powered Braille Label Printer

## Inspiration

Imagine walking into a grocery store and realizing that nearly every package is silent to your sense of touch. In the United States, unlike public signage covered by the ADA, there is no universal requirement for Braille on food products. Prescription drugs have some best-practice guidelines, but for everyday items like milk, soda, or cereal, Braille is virtually nonexistent.

As a result, millions of visually impaired Americans rely on workarounds like QR codes, talking label devices, or smartphone apps just to identify something as simple as a can of soup. Labels, the most basic gateway to information, remain out of reach.

Dotify was created to close this gap. It translates the visual world into concise, meaningful messages at the click of a button – and automatically prints out the corresponding Braille.

## What it does

Dotify is an AI-powered portable device that captures an image, understands its content, and prints out a short label/sticker that can be read by touch. This is a super easy way to make shops, households, and other places in our community more accessible for the visually impaired.

Capture: The user points the device at an object or scene and takes a picture.
Understand: The image is processed by our software and analyzed through the Google Gemini API, which generates a concise text description (e.g., "a blue ceramic mug with a flower on it").
Translate: The Arduino receives this description and converts it into Braille character data.
Feel: Servo motors actuate pins to emboss the Braille dots, and a DC motor advances the paper for the next character.

## How we built it

Dotify combines hardware, software, and AI into a single mechatronic system:

Power System: 4×AA batteries powering the Arduino, motor driver, and six servos.
Arduino UNO R4: The "brain" of the device, managing servo motions and motor timing.
Google Gemini API: Web app takes photo and interprets visual data into descriptive text.
Micro Servos (x6): Actuate Braille pins to emboss dots.
DC Motor + Motor Driver: Feeds paper consistently between letters.
3D-Printed Housing: Keeps all components aligned in a compact, functional case.

## Quick Start Guide

### Prerequisites
- Node.js and npm
- Python 3
- Arduino IDE
- Google Gemini API key

### 1. Get Your API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new project
3. Generate your API key
4. Copy the key for the next step

### 2. Configure API Key
Replace the placeholder in `run_python_server.bat`:
```batch
set GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Development Servers

**Frontend (React app):**
```bash
npm run dev
```
Access at: `http://localhost:5173`

**Backend (Python AI server):**
```bash
npm run serve
# OR manually:
python simple_server.py
```
Access at: `http://localhost:8000`

### 5. Setup Arduino Hardware
1. Upload `arduino/dotify_braille.ino` to your Arduino Uno R4
2. Connect Arduino to computer via USB
3. In the web app, navigate to "Serial Connection"
4. Select your Arduino's COM port
5. Click "Connect"

## Usage

1. **Take Photo**: Use the camera interface or upload an image
2. **AI Analysis**: The system analyzes the image and generates a concise description
3. **Review Description**: Ensure the description is clear and under 4 words for optimal Braille printing
4. **Print Label**: Send the description to the Arduino for Braille embossing
5. **Apply Label**: The resulting Braille label can be applied to products or objects

## Hardware Requirements

- **Arduino Uno R4**: Main controller
- **6x Micro Servos**: Braille pin actuation
- **DC Motor + Driver**: Paper feed mechanism
- **Braille Paper**: Standard Braille paper or label stock
- **3D-Printed Housing**: Component enclosure
- **4x AA Batteries**: Power supply
- **USB Cable**: Communication with computer

## Software Components

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Python + Google Gemini AI
- **Arduino**: C++ for servo and motor control
- **Communication**: Web Serial API for browser-to-Arduino communication



