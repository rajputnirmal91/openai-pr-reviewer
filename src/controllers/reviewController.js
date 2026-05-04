const core = require('@actions/core');
const { buildReviewPrompt } = require('../reviewPrompt');
const { retryWithBackoff, cleanJsonResponse, parseJsonSafely } = require('../utils/helpers');
const { validatePatch, validateModelResponse } = require('../utils/validators');
const { normalizeComments } = require('../utils/commentNormalizer');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Review code using AI model
 */
const reviewCode = async (model, patch, filename) => {
  try {
    // Validate patch
    if (!validatePatch(patch)) {
      core.debug(`Skipping ${filename}: ${ERROR_MESSAGES.EMPTY_PATCH}`);
      return { comments: [] };
    }

    const prompt = buildReviewPrompt(filename, patch);

    // Generate review with retry logic
    const result = await retryWithBackoff(() => model.generateContent(prompt));
    const response = await result.response;

    // Validate response
    const text = validateModelResponse(response);

    // Clean and parse JSON
    const cleanedText = cleanJsonResponse(text);
    const parsed = parseJsonSafely(cleanedText);

    // Normalize comments
    const normalizedComments = normalizeComments(parsed.comments);

    return { comments: normalizedComments };
  } catch (error) {
    core.warning(`Failed to review ${filename}: ${error.message}`);
    return { comments: [] };
  }
};

module.exports = {
  reviewCode,
};
