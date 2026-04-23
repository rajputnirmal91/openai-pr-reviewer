module.exports = {
  responseFormat: {
    description: "Strict JSON format for code review responses",
    schema: {
      comments: [
        {
          line: "number",
          severity: "critical | warning | suggestion",
          category: "bug | performance | security | readability | architecture | best_practice",
          text: "clear, specific, and actionable review comment",
          suggestion: "optional: proposed fix or improvement"
        }
      ]
    },
    emptyResponse: { comments: [] }
  },

  rules: [
    "ONLY return valid JSON (no markdown, no explanations outside JSON)",
    "Do NOT include any text before or after JSON",
    "Each comment must be precise, actionable, and reference the exact issue",
    "Do NOT repeat similar comments - consolidate related issues",
    "Prioritize critical issues over suggestions",
    "If no issues found, return: { \"comments\": [] }",
    "Include a 'suggestion' field when you can propose a specific fix",
    "Focus on issues that impact production: bugs, security, performance, maintainability"
  ],

  reviewGuidelines: {
    bugsAndLogicErrors: [
      "Incorrect logic, broken conditions, missing dependencies",
      "Null/undefined risks, off-by-one errors, race conditions, type mismatches",
      "Missing error handling, uncaught exceptions, unhandled promise rejections",
      "Edge cases not covered (empty arrays, null values, boundary conditions)",
      "Incorrect API usage or library misuse"
    ],

    performance: [
      "Expensive computations inside render/hot paths",
      "Missing memoization (useMemo, useCallback, React.memo) where needed",
      "Inefficient rendering patterns (re-renders on every parent update)",
      "N+1 queries, unnecessary API calls, missing pagination",
      "Memory leaks (event listeners not cleaned up, subscriptions not unsubscribed)",
      "Blocking operations on main thread, synchronous I/O",
      "Large bundle sizes, unused dependencies"
    ],

    security: [
      "XSS risks (dangerouslySetInnerHTML, eval, innerHTML with user input)",
      "Exposure of sensitive data (API keys, tokens, PII in logs/comments)",
      "Unsafe API usage (no HTTPS, missing CORS validation)",
      "Injection vulnerabilities (SQL, command, template injection)",
      "Missing input validation or sanitization",
      "Insecure authentication/authorization patterns",
      "Secrets hardcoded in source code"
    ],

    readabilityAndMaintainability: [
      "Poor naming conventions (single letters, unclear abbreviations)",
      "Large or complex functions/components (>200 lines, too many responsibilities)",
      "Duplicate logic, DRY violations, copy-paste code",
      "Missing or unclear documentation, no JSDoc comments",
      "Magic numbers/strings without explanation",
      "Inconsistent code style or formatting",
      "Dead code or unused variables"
    ],

    architectureAndScalability: [
      "Tight coupling between modules, hard to test",
      "Poor separation of concerns (business logic mixed with UI)",
      "Non-reusable patterns, monolithic components",
      "Scalability issues (linear complexity where exponential expected)",
      "Missing abstraction layers",
      "Circular dependencies"
    ],

    reactBestPractices: [
      "Unnecessary re-renders (missing keys, inline object/function creation)",
      "Missing keys in lists (causes state bugs when list reorders)",
      "Improper state management (state in wrong component, prop drilling)",
      "React hook misuse (useEffect without dependencies, hooks in conditionals)",
      "Anti-patterns (setState in render, direct DOM manipulation)",
      "Missing loading/error states",
      "Prop drilling instead of context/state management"
    ]
  },

  commentingRules: {
    critical: "Production-breaking bugs, security vulnerabilities, data loss risks, crashes, unhandled errors",
    warning: "Performance issues, architectural concerns, maintainability problems, potential bugs",
    suggestion: "Minor improvements, code style, documentation, nice-to-haves",
    guidelines: [
      "Reference the exact issue clearly with context",
      "Suggest a specific fix when possible (include code snippet if helpful)",
      "Explain the impact: why this matters for production",
      "Avoid nitpicking style issues unless they impact readability",
      "Consider the context: is this a library, API, frontend, or backend code?",
      "Flag missing tests or test coverage gaps",
      "Highlight potential future maintenance issues"
    ]
  }
};
