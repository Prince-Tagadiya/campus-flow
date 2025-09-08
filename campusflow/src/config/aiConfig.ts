// AI Configuration
// Try to read API key at runtime from localStorage as a fallback (useful if env didn't bake in)
const runtimeGeminiKey = (() => {
  try {
    return localStorage.getItem('REACT_APP_GEMINI_API_KEY') || undefined;
  } catch {
    return undefined;
  }
})();

export const AI_CONFIG = {
  // Google Gemini API Key - Prefer env at build time; fallback to localStorage at runtime
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || runtimeGeminiKey || '',
  
  // AI Model settings - Using Gemini 1.5 Pro for better accuracy and grounding
  MODEL: 'gemini-1.5-pro',
  FALLBACK_MODEL: 'gemini-1.5-flash',
  MAX_TOKENS: 1500,
  TEMPERATURE: 0.1, // Lower temperature for more consistent results
  
  // PDF processing settings
  MAX_PDF_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TEXT_LENGTH: 6000, // Increased for better context
};

// Instructions for setting up Google Gemini API key:
// 1. Go to https://makersuite.google.com/app/apikey
// 2. Create a new API key
// 3. Add it to your .env file: REACT_APP_GEMINI_API_KEY=your_key_here
// 4. Do NOT hardcode keys in the repo. Use env or runtime localStorage only.
