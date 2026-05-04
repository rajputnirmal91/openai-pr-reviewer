const core = require('@actions/core');
const { CONFIG } = require('./constants');

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async (fn, retries = CONFIG.MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, i);
      core.warning(`Attempt ${i + 1} failed, retrying in ${delay}ms: ${error.message}`);
      await sleep(delay);
    }
  }
};

/**
 * Extract first number from string (e.g., "1-3" -> 1)
 */
const extractLineNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 1 ? value : 1;
  }
  
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  }
  
  return 1;
};

/**
 * Clean markdown wrappers from JSON response
 */
const cleanJsonResponse = (text) => {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
};

/**
 * Validate and parse JSON safely
 */
const parseJsonSafely = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
};

module.exports = {
  sleep,
  retryWithBackoff,
  extractLineNumber,
  cleanJsonResponse,
  parseJsonSafely,
};
