const core = require('@actions/core');
const { repair } = require('jsonrepair');
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
 * Clean markdown wrappers and fix common JSON issues from model response
 */
const cleanJsonResponse = (text) => {
  let cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // Remove any leading/trailing text before first { and after last }
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  // Fix trailing commas before closing brackets/braces
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // Remove comments (// and /* */ style)
  cleaned = cleaned.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  return cleaned.trim();
};

/**
 * Validate and parse JSON safely using jsonrepair
 */
const parseJsonSafely = (text) => {
  try {
    // First try standard JSON parse
    return JSON.parse(text);
  } catch (error) {
    try {
      // If that fails, use jsonrepair to fix common issues
      const repaired = repair(text);
      return JSON.parse(repaired);
    } catch (repairError) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }
};

module.exports = {
  sleep,
  retryWithBackoff,
  extractLineNumber,
  cleanJsonResponse,
  parseJsonSafely,
};
