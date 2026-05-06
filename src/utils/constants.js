const VALID_SEVERITIES = ['critical', 'warning', 'suggestion'];
const VALID_CATEGORIES = ['bug', 'performance', 'security', 'readability', 'architecture', 'best_practice'];

const CONFIG = {
  MAX_RETRIES: 5,
  RETRY_DELAY_MS: 2000,
  COMMENT_DELAY_MS: 500,
  MAX_COMMENT_LENGTH: 500,
  DEFAULT_MODEL: 'gemini-1.5-flash',
  DEFAULT_MAX_FILES: 10,
};

/**
 * Generation config for AI model
 * Controls output quality, creativity, and format
 */
const GENERATION_CONFIG = {
  maxOutputTokens: 2048,
  temperature: 0.3, // Lower = more deterministic, higher = more creative
  topP: 0.95, // Nucleus sampling
  topK: 40, // Top-K sampling
  responseMimeType: 'application/json', // Enforce JSON output
  stopSequences: [], // Optional: sequences to stop generation
};

/**
 * Safety settings for content filtering
 */
const SAFETY_SETTINGS = [
  {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_NONE',
  },
  {
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_NONE',
  },
];

const ERROR_MESSAGES = {
  GITHUB_TOKEN_REQUIRED: 'github-token is required',
  AI_KEY_REQUIRED: 'gemini-api-key is required',
  INVALID_MAX_FILES: 'max-files must be a positive number',
  PR_DATA_NOT_FOUND: 'Pull request data not found in context',
  NO_FILES_TO_REVIEW: 'No files to review',
  EMPTY_PATCH: 'empty patch',
  NO_RESPONSE: 'No response from model',
  INVALID_RESPONSE_TEXT: 'Invalid response text from model',
  EMPTY_RESPONSE: 'Empty response after cleaning',
};

module.exports = {
  VALID_SEVERITIES,
  VALID_CATEGORIES,
  CONFIG,
  GENERATION_CONFIG,
  SAFETY_SETTINGS,
  ERROR_MESSAGES,
};
