module.exports = {
  responseFormat: {
    schema: { comments: [{ line: 1, severity: "critical|warning|suggestion", category: "bug|performance|security|maintainability|architecture", text: "actionable comment" }] },
    emptyResponse: { comments: [] }
  },

  // Split rules by file type so only relevant ones are sent
  guidelines: {
    common: [
      // Bugs
      "Flag broken logic, null/undefined risks, off-by-one errors, race conditions, type mismatches",
      "Flag missing error handling, uncaught exceptions, unhandled promise rejections",
      "Flag edge cases not covered (empty arrays, null values, boundary conditions)",
      // Security
      "Flag XSS risks (dangerouslySetInnerHTML, eval, innerHTML with user input)",
      "Flag exposed secrets, API keys, tokens, or PII in logs/comments",
      "Flag injection vulnerabilities (SQL, command, template injection)",
      "Flag missing input validation or sanitization",
      // Performance
      "Flag N+1 queries, unnecessary API calls, memory leaks, blocking main thread ops",
      // Maintainability
      "Flag dead code, magic numbers, functions >200 lines, DRY violations",
      "Flag poor naming (single letters, unclear abbreviations)"
    ],
    react: [
      "Flag missing list keys, inline object/function creation causing re-renders",
      "Flag hook misuse (missing deps array, hooks in conditionals)",
      "Flag prop drilling, missing loading/error states, setState in render",
      "Flag missing memoization (useMemo, useCallback) in hot paths"
    ],
    backend: [
      "Flag synchronous I/O, missing pagination, insecure auth patterns",
      "Flag unsafe API usage (no HTTPS, missing CORS), hardcoded secrets",
      "Flag tight coupling, circular dependencies, missing abstraction layers"
    ]
  },

  severityDefs: {
    critical: "Production-breaking bugs, security vulnerabilities, data loss, crashes",
    warning: "Performance issues, architectural concerns, potential bugs",
    suggestion: "Minor improvements, style, documentation"
  }
};
