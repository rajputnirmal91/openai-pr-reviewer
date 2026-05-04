const { GoogleGenerativeAI } = require('@google/generative-ai');
const { CONFIG, GENERATION_CONFIG, SAFETY_SETTINGS } = require('../utils/constants');

/**
 * Initialize Gemini AI model with optimized settings
 * @param {string} apiKey - Google API key
 * @param {string} modelName - Model name (default: gemini-1.5-flash)
 * @returns {object} Configured generative model
 */
const initializeModel = (apiKey, modelName = CONFIG.DEFAULT_MODEL) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
  });

  return model;
};

/**
 * Get available model configuration options
 * @returns {object} Configuration details
 */
const getModelConfig = () => {
  return {
    generationConfig: GENERATION_CONFIG,
    safetySettings: SAFETY_SETTINGS,
    description: {
      temperature: 'Controls randomness (0-2). Lower = deterministic, Higher = creative',
      maxOutputTokens: 'Maximum tokens in response (~4 chars per token)',
      topP: 'Nucleus sampling threshold (0-1)',
      topK: 'Top-K sampling (number of tokens to consider)',
      responseMimeType: 'Output format (application/json for structured responses)',
      stopSequences: 'Sequences that stop generation',
    },
  };
};

module.exports = {
  initializeModel,
  getModelConfig,
};
