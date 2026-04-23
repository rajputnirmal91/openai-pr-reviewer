module.exports = {
  responseFormat: {
    description: "Strict JSON format for code review responses",
    schema: {
      comments: [
        {
          line: "number",
          severity: "critical | warning | suggestion",
          category: "bug | performance | security | readability | architecture | best_practice",
          text: "clear, specific, and actionable review comment"
        }
      ]
    },
    emptyResponse: { comments: [] }
  },

  rules: [
    "ONLY return valid JSON (no markdown, no explanations outside JSON)",
    "Do NOT include any text before or after JSON",
    "Each comment must be precise and actionable",
    "Do NOT repeat similar comments",
    "If no issues, return: { \"comments\": [] }"
  ],

  reviewGuidelines: {
    bugsAndLogicErrors: [
      "Incorrect logic, broken conditions, missing dependencies",
      "Null/undefined risks, off-by-one errors, race conditions",
      "Missing error handling or edge case coverage"
    ],

    performance: [
      "Expensive computations inside render",
      "Missing memoization where needed",
      "Inefficient rendering patterns, N+1 queries",
      "Memory leaks, blocking operations"
    ],

    security: [
      "XSS risks (dangerouslySetInnerHTML, unsafe inputs)",
      "Exposure of sensitive data",
      "Unsafe API usage, injection vulnerabilities"
    ],

    readabilityAndMaintainability: [
      "Poor naming conventions",
      "Large or complex components/functions",
      "Duplicate logic, DRY violations",
      "Missing or unclear documentation"
    ],

    architectureAndScalability: [
      "Tight coupling, poor separation of concerns",
      "Non-reusable patterns",
      "Scalability issues"
    ],

    reactBestPractices: [
      "Unnecessary re-renders",
      "Missing keys in lists",
      "Improper state management",
      "React hook misuse (useEffect, useMemo, useCallback)",
      "Anti-patterns in component design"
    ]
  },

  commentingRules: {
    critical: "Use for bugs, security issues, or breaking problems",
    warning: "Use for performance or architectural concerns",
    suggestion: "Use for minor improvements",
    guidelines: [
      "Reference the exact issue clearly",
      "Suggest a fix when possible"
    ]
  }
};
