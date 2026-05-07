const reviewRules = require('./reviewRules');

function buildReviewPrompt(filename, patch) {
  const { responseFormat, rules, reviewGuidelines, commentingRules } = reviewRules;

  return `You are a senior full-stack engineer performing a strict production-level code review.

CONTEXT:
- File: ${filename}
- Review Type: Git diff analysis
- Goal: Identify ACTUAL bugs, security issues, performance problems, and maintainability concerns in the code

RESPONSE FORMAT (STRICT JSON ONLY):
${JSON.stringify(responseFormat.schema, null, 2)}

CRITICAL RULES:
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

CSS & Styling (if applicable):
${reviewGuidelines.cssAndStyling.map(item => `- ${item}`).join('\n')}

SEVERITY LEVELS:
- critical: ${commentingRules.critical}
- warning: ${commentingRules.warning}
- suggestion: ${commentingRules.suggestion}

COMMENTING GUIDELINES:
${commentingRules.guidelines.map(guideline => `- ${guideline}`).join('\n')}

IMPORTANT REMINDERS:
1. Only comment on ACTUAL problems in the diff, not theoretical ones
2. Do NOT suggest things that are already being done in the code
3. Do NOT use vague language like "ensure", "make sure", "consider", "should"
4. Be specific: What is wrong? Why does it matter? How to fix it?
5. If the code already has error handling, validation, or best practices, do NOT suggest adding them
6. Focus on real issues that would break production or significantly impact code quality
7. YOU CAN ONLY SEE THIS DIFF - do not suggest checking other files or the entire codebase
8. If a function/variable is removed, only flag it if you can see it's actually called in THIS diff
9. Do NOT suggest "ensure no other code references this" - you cannot verify that from a single diff
10. Only flag actual ReferenceErrors if the removed code is clearly called in the visible diff

DIFF TO REVIEW:
${patch}`;
}

module.exports = { buildReviewPrompt };
