const reviewRules = require('./reviewRules');

function buildReviewPrompt(filename, patch) {
  const { responseFormat, rules, reviewGuidelines, commentingRules } = reviewRules;

  return `You are a senior full-stack engineer performing a strict production-level code review.

Analyze the following Git diff and return ONLY valid JSON in the exact format below:

${JSON.stringify(responseFormat.schema, null, 2)}

Rules:
${rules.map(rule => `- ${rule}`).join('\n')}

Review Guidelines:

Bugs & Logic Errors:
${reviewGuidelines.bugsAndLogicErrors.map(item => `- ${item}`).join('\n')}

Performance:
${reviewGuidelines.performance.map(item => `- ${item}`).join('\n')}

Security:
${reviewGuidelines.security.map(item => `- ${item}`).join('\n')}

Readability & Maintainability:
${reviewGuidelines.readabilityAndMaintainability.map(item => `- ${item}`).join('\n')}

Architecture & Scalability:
${reviewGuidelines.architectureAndScalability.map(item => `- ${item}`).join('\n')}

React Best Practices (if applicable):
${reviewGuidelines.reactBestPractices.map(item => `- ${item}`).join('\n')}

Commenting Rules:
- critical: ${commentingRules.critical}
- warning: ${commentingRules.warning}
- suggestion: ${commentingRules.suggestion}
${commentingRules.guidelines.map(guideline => `- ${guideline}`).join('\n')}

File: ${filename}
Diff:
${patch}`;
}

module.exports = { buildReviewPrompt };
