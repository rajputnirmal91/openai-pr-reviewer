const axios = require('axios');
const { CONFIG, GENERATION_CONFIG } = require('../utils/constants');

/**
 * Initialize Ollama AI model
 * @param {string} apiKey - Ollama API key
 * @param {string} modelName - Model name (default: gpt-oss:20b-cloud)
 * @param {string} ollamaUrl - Ollama server URL
 * @returns {object} Configured Ollama client
 */
const initializeModel = (apiKey, modelName = CONFIG.DEFAULT_MODEL, ollamaUrl = CONFIG.OLLAMA_URL) => {
  return {
    apiKey,
    modelName,
    ollamaUrl,
    generateContent: async (prompt) => {
      const response = await axios.post(`${ollamaUrl}api/generate`, {
        model: modelName,
        prompt: prompt,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        response: {
          text: () => response.data.response,
        },
      };
    },
  };
};

/**
 * Get available model configuration options
 * @returns {object} Configuration details
 */
const getModelConfig = () => {
  return {
    generationConfig: GENERATION_CONFIG,
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
