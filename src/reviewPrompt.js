const { guidelines, severityDefs, responseFormat } = require('./reviewRules');

// Detect file type from filename to send only relevant guidelines
function detectFileType(filename) {
  if (/\.(jsx?|tsx?)$/.test(filename)) {
    return filename.match(/\.(jsx|tsx)$/) || filename.includes('component') || filename.includes('Component')
      ? 'react'
      : 'js';
  }
  return 'backend';
}

function buildReviewPrompt(filename, patch) {
  const fileType = detectFileType(filename);

  // Only include React or backend guidelines when relevant
  const relevantGuidelines = [
    ...guidelines.common,
    ...(fileType === 'react' ? guidelines.react : guidelines.backend)
  ];

  // Compact format — avoids verbose section headers
  return `You are a senior engineer doing a strict production code review.
Return ONLY valid JSON, no markdown, no extra text.
Schema: ${JSON.stringify(responseFormat.schema)}
If no issues: ${JSON.stringify(responseFormat.emptyResponse)}

Severity: critical=${severityDefs.critical} | warning=${severityDefs.warning} | suggestion=${severityDefs.suggestion}

Rules (apply all):
${relevantGuidelines.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Additional rules:
- Consolidate related issues into one comment
- Use starting line number if issue spans multiple lines
- Only flag issues that impact production

File: ${filename}
Diff:
${patch}`;
}

module.exports = { buildReviewPrompt };
