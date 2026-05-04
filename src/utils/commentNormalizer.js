const core = require('@actions/core');
const {
  VALID_SEVERITIES,
  VALID_CATEGORIES,
  CONFIG,
} = require('./constants');
const {
  extractLineNumber,
} = require('./helpers');
const {
  isValidComment,
  isValidSeverity,
  isValidCategory,
} = require('./validators');

/**
 * Normalize a single comment to ensure all fields are valid
 */
const normalizeComment = (comment) => {
  try {
    if (!isValidComment(comment)) {
      return null;
    }

    // Normalize line number
    const line = extractLineNumber(comment.line);

    // Normalize severity
    const severity = isValidSeverity(comment.severity)
      ? comment.severity
      : 'suggestion';

    // Normalize category
    const category = isValidCategory(comment.category)
      ? comment.category
      : 'best_practice';

    // Validate and normalize text
    const text = normalizeText(comment.text);
    if (!text) {
      return null;
    }

    return {
      line,
      severity,
      category,
      text,
    };
  } catch (error) {
    core.debug(`Failed to normalize comment: ${error.message}`);
    return null;
  }
};

/**
 * Normalize comment text
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return null;
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.substring(0, CONFIG.MAX_COMMENT_LENGTH);
};

/**
 * Normalize all comments from response
 */
const normalizeComments = (comments) => {
  if (!Array.isArray(comments)) {
    return [];
  }

  return comments
    .map(normalizeComment)
    .filter(comment => comment !== null);
};

module.exports = {
  normalizeComment,
  normalizeComments,
};
