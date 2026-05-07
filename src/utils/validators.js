const { VALID_SEVERITIES, VALID_CATEGORIES, ERROR_MESSAGES } = require('./constants');

/**
 * Validate environment variables
 */
const validateEnvironment = (token, aiKey, maxFiles) => {
  if (!token) {
    throw new Error(ERROR_MESSAGES.GITHUB_TOKEN_REQUIRED);
  }
  
  if (!aiKey) {
    throw new Error(ERROR_MESSAGES.AI_KEY_REQUIRED);
  }
  
  const parsedMaxFiles = parseInt(maxFiles, 10);
  if (isNaN(parsedMaxFiles) || parsedMaxFiles < 1) {
    throw new Error(ERROR_MESSAGES.INVALID_MAX_FILES);
  }
  
  return parsedMaxFiles;
};

/**
 * Validate PR context
 */
const validatePRContext = (context) => {
  if (!context.payload.pull_request) {
    throw new Error(ERROR_MESSAGES.PR_DATA_NOT_FOUND);
  }
  
  return context.payload.pull_request;
};

/**
 * Validate patch content
 */
const validatePatch = (patch) => {
  return patch && typeof patch === 'string' && patch.trim().length > 0;
};

/**
 * Validate model response
 */
const validateModelResponse = (response) => {
  if (!response) {
    throw new Error(ERROR_MESSAGES.NO_RESPONSE);
  }
  
  const text = response.text();
  if (!text || typeof text !== 'string') {
    throw new Error(ERROR_MESSAGES.INVALID_RESPONSE_TEXT);
  }
  
  if (!text.trim()) {
    throw new Error(ERROR_MESSAGES.EMPTY_RESPONSE);
  }
  
  return text;
};

/**
 * Validate comment object
 */
const isValidComment = (comment) => {
  return comment && typeof comment === 'object';
};

/**
 * Validate severity
 */
const isValidSeverity = (severity) => VALID_SEVERITIES.includes(severity);

/**
 * Validate category
 */
const isValidCategory = (category) => VALID_CATEGORIES.includes(category);

/**
 * Check if file should be reviewed based on extension
 */
const isSupportedFileType = (filename) => {
  const supportedExtensions = [
    '.js', '.jsx', '.ts', '.tsx',  // JavaScript/TypeScript
    '.css', '.scss', '.sass', '.less',  // Stylesheets
    '.html', '.htm',  // HTML
    '.vue', '.svelte',  // Other frameworks
  ];
  
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return supportedExtensions.includes(ext);
};

module.exports = {
  validateEnvironment,
  validatePRContext,
  validatePatch,
  validateModelResponse,
  isValidComment,
  isValidSeverity,
  isValidCategory,
  isSupportedFileType,
};
