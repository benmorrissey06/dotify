//Arduino code here
// ------------------------------------------------------------
//              Mini Braille Printer (UNO R4)
// ------------------------------------------------------------
#include <Arduino.h>
#include <ctype.h>
#include <Servo.h>
#include <Wire.h>

// ------------------------ Config ----------------------------
// Servo pins
static const uint8_t SERVO_PINS[6] = {3, 5, 6, 9, 10, 11}; // 6, 9 reversed
// {3, 5, 6, 9, 10, 11} : (1, 2, 3, 4, 5, 6)

// Servo angles for dot states (tweak for your mechanism)
static const uint8_t DOT_UP = 20;   // activated
static const uint8_t DOT_DOWN = 0;     // deactivated

// Timings (ms)
static const unsigned SETTLE_MS = 800; // wait after setting a cell
static const unsigned BETWEEN_LETTERS_MS = 200;  // pause between letters
static const unsigned WORD_GAP_MS = 600;  // motor run time to create a space
static const unsigned LETTER_GAP_MS = 300;   // motor run time for gaps between letters

// ------------------------ Braille List -----------------------------
struct Cell { uint8_t d[6]; };
#define C6(a,b,c,d,e,f)  { { (uint8_t)(a),(uint8_t)(b),(uint8_t)(c),(uint8_t)(d),(uint8_t)(e),(uint8_t)(f) } }

// Braille table for A–Z (6-dot, dots numbered 1..6 = [0..5])
static const Cell BRAILLE_AZ[26] = {
  /* A */ C6(1,0,0,0,0,0), /* B */ C6(1,1,0,0,0,0), /* C */ C6(1,0,0,1,0,0),
  /* D */ C6(1,0,0,1,1,0), /* E */ C6(1,0,0,0,1,0), /* F */ C6(1,1,0,1,0,0),
  /* G */ C6(1,1,0,1,1,0), /* H */ C6(1,1,0,0,1,0), /* I */ C6(0,1,0,1,0,0),
  /* J */ C6(0,1,0,1,1,0), /* K */ C6(1,0,1,0,0,0), /* L */ C6(1,1,1,0,0,0),
  /* M */ C6(1,0,1,1,0,0), /* N */ C6(1,0,1,1,1,0), /* O */ C6(1,0,1,0,1,0),
  /* P */ C6(1,1,1,1,0,0), /* Q */ C6(1,1,1,1,1,0), /* R */ C6(1,1,1,0,1,0),
  /* S */ C6(0,1,1,1,0,0), /* T */ C6(0,1,1,1,1,0), /* U */ C6(1,0,1,0,0,1),
  /* V */ C6(1,1,1,0,0,1), /* W */ C6(0,1,0,1,1,1), /* X */ C6(1,0,1,1,0,1),
  /* Y */ C6(1,0,1,1,1,1), /* Z */ C6(1,0,1,0,1,1)
};

// A blank spacer (unknown chars / space)
static const Cell BRAILLE_BLANK = C6(0,0,0,0,0,0);

// ------------------------ Braille Pin --------------------------
Servo s1, s2, s3, s4, s5, s6; // 6 servos for one braille cell (dots 1..6)

// ------------------------ Paper Feed ------------------
// Wire these to your motor driver inputs (e.g., L298N/DRV8833 IN1/IN2).
static const uint8_t PAPER_IN1_PIN = 12;   // Direction A
static const uint8_t PAPER_IN2_PIN = 13;   // Direction B

// Flip this if the paper moves the wrong way when creating gaps.
static const bool PAPER_FORWARD_DIR = true;

static inline void paperStop() {
  // Coast: both LOW. (If you want active brake: set both HIGH on some drivers.)
  digitalWrite(PAPER_IN1_PIN, LOW);
  digitalWrite(PAPER_IN2_PIN, LOW);
}

static inline void paperRunForward() {
  if (PAPER_FORWARD_DIR) {
    digitalWrite(PAPER_IN1_PIN, HIGH);
    digitalWrite(PAPER_IN2_PIN, LOW);
  } else {
    digitalWrite(PAPER_IN1_PIN, LOW);
    digitalWrite(PAPER_IN2_PIN, HIGH);
  }
}

// Time-based pulse helpers (time control)
static inline void paperForwardPulse(unsigned ms) {
  paperRunForward();
  delay(ms);
  paperStop();
}

// --------------------- Declarations -------------------------
String readLine();
void   printPhrase(const String& line);
void   printWord(const String& word);
void   advancedLetterGap();
void   advanceWordGap();
void   setBrailleCell(const uint8_t cell[6], unsigned settle_ms = SETTLE_MS);
Cell   charToBraille(char c);

// ------------------------ Setup -----------------------------
void setup() {
  Serial.begin(9600);

  // Attach servos at safe starting position
  // SERVO_PINS[6] = {3, 5, 6, 9, 10, 11}
  s1.attach(SERVO_PINS[0]); s1.write(DOT_DOWN);
  s2.attach(SERVO_PINS[1]); s2.write(DOT_DOWN);
  s3.attach(SERVO_PINS[2]); s3.write(175); // reversed
  s4.attach(SERVO_PINS[3]); s4.write(180); // reversed
  s5.attach(SERVO_PINS[4]); s5.write(5);
  s6.attach(SERVO_PINS[5]); s6.write(5);

  // Paper feed motor (2-pin driver)
  pinMode(PAPER_IN1_PIN, OUTPUT);
  pinMode(PAPER_IN2_PIN, OUTPUT);
  paperStop();
}

// ------------------------- Loop -----------------------------
void loop() {
  if (Serial.available()) {
    String line = readLine();
    if (line.length() > 0) {
      advanceWordGap();
      printPhrase(line);
      setBrailleCell(BRAILLE_BLANK.d, SETTLE_MS); // ensure all dots down
      advanceWordGap(); // trailing blank space for peel-off
    }
  }
}

// --------------------- Implementations ----------------------
String readLine() {
  // Read up to newline; trim trailing CR/LF.
  String s = Serial.readStringUntil('\n');
  // Remove trailing \r if present
  if (s.endsWith("\r")) s.remove(s.length() - 1);
  return s;
}

void printPhrase(const String& line) {
  // Minimal tokenizer: sequences of non-space chars are words; spaces trigger motor gap.
  const int n = line.length();
  int i = 0;

  while (i < n) {
    // Skip leading spaces
    while (i < n && isspace(line[i])) i++;

    // Gather 1 word
    int start = i;
    while (i < n && !isspace(line[i])) i++;
    int end = i;

    if (end > start) {
      // Print 1 word
      String word = line.substring(start, end);
      printWord(word);

      // Look ahead: is there another word left? If so, motor-driven gap between words.
      int j = i;
      bool moreWords = false;
      while (j < n) {
        if (!isspace(line[j])) { moreWords = true; break; }
        j++;
      }
      if (moreWords) {
        advanceWordGap();
      }
    }
    // Loop continues; i is at whitespace or end.
  }
}

void printWord(const String& word) {
  // Output letters in the word as braille cells.
  for (uint16_t k = 0; k < word.length(); ++k) {
    Cell cell = charToBraille(word[k]);
    setBrailleCell(cell.d, SETTLE_MS);
    delay(BETWEEN_LETTERS_MS);

    if (k < word.length() - 1) {
      advanceLetterGap(); // motor-driven gap between letters
    }
  }
  
}

Cell charToBraille(char c) {
  // Map ASCII to 6-dot braille; A–Z supported, case-insensitive; others blank.
  if (c >= 'a' && c <= 'z') c = (char)(c - 'a' + 'A');
  if (c >= 'A' && c <= 'Z') return BRAILLE_AZ[c - 'A'];
  return BRAILLE_BLANK;
}

void setBrailleCell(const uint8_t cell[6], unsigned settle_ms) {
  // Write each dot state; 1 => DOT_UP, 0 => DOT_DOWN
    // Dot 1
  if (cell[0]) {
    s1.write(DOT_UP);
  } else {
    s1.write(DOT_DOWN);
  }

  // Dot 2
  if (cell[1]) {
    s2.write(DOT_UP);
  } else {
    s2.write(DOT_DOWN);
  }

  // Dot 3 - // reversed
  if (cell[2]) {
    s3.write(155);
  } else {
    s3.write(175);
  }

  // Dot 4 - // reversed
  if (cell[3]) {
    s4.write(160);
  } else {
    s4.write(180);
  }

  // Dot 5
  if (cell[4]) {
    s5.write(25);
  } else {
    s5.write(5);
  }

  // Dot 6
  if (cell[5]) {
    s6.write(25);
  } else {
    s6.write(5);
  }

  delay(settle_ms);

  s1.write(DOT_DOWN);
  s2.write(DOT_DOWN); 
  s3.write(175); // reversed
  s4.write(180); // reversed
  s5.write(5);
  s6.write(5);
  delay(100);
}

void advanceLetterGap() {
  // Move paper forward for a small, fixed time to create a letter gap.
  paperForwardPulse(LETTER_GAP_MS);
}

void advanceWordGap() {
  // Move paper forward longer to create a word gap.
  paperForwardPulse(WORD_GAP_MS);
}
