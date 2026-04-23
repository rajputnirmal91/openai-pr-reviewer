const reviewRules = require('./reviewRules');

function buildReviewPrompt(filename, patch) {
  const { responseFormat, rules, reviewGuidelines, commentingRules } = reviewRules;

  return `You are a senior full-stack engineer performing a strict production-level code review.

CONTEXT:
- File: ${filename}
- Review Type: Git diff analysis
- Goal: Identify bugs, security issues, performance problems, and maintainability concerns

RESPONSE FORMAT (STRICT JSON ONLY):
${JSON.stringify(responseFormat.schema, null, 2)}

RULES:
${rules.map(rule => `- ${rule}`).join('\n')}

REVIEW GUIDELINES:

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

SEVERITY LEVELS:
- critical: ${commentingRules.critical}
- warning: ${commentingRules.warning}
- suggestion: ${commentingRules.suggestion}

COMMENTING GUIDELINES:
${commentingRules.guidelines.map(guideline => `- ${guideline}`).join('\n')}

DIFF TO REVIEW:
${patch}`;
}

module.exports = { buildReviewPrompt };
