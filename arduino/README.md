# Dotify Arduino Code

This folder contains the Arduino code for the Dotify Braille printer system.

## Files:
- `dotify_braille.ino` - Main Arduino sketch for Braille display control
- `examples/` - Example sketches and test code

## Hardware Requirements:
- Arduino Uno/Nano/ESP32
- Braille display module
- Serial communication (USB)
- Power supply

## Setup Instructions:
1. Install Arduino IDE
2. Connect Arduino to computer via USB
3. Select correct board and port in Arduino IDE
4. Upload the `dotify_braille.ino` sketch
5. Open Serial Monitor (9600 baud)
6. Connect to the web app via serial communication

## Communication Protocol:
- Receives 4-word descriptions via serial
- Converts text to Braille patterns
- Displays on Braille module
- Sends confirmation back to web app

## Libraries Required:
- Standard Arduino libraries
- Custom Braille conversion functions

## Troubleshooting:
- Check serial connection
- Verify baud rate (9600)
- Ensure proper power supply
- Check Braille module connections
