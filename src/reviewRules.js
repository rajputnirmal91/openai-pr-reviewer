module.exports = {
  responseFormat: {
    description: "Strict JSON format for code review responses",
    schema: {
      comments: [
        {
          line: 1,
          severity: "critical",
          category: "bug",
          text: "clear, specific, and actionable review comment"
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
    "The 'line' field MUST be a single integer number (e.g., 5, not '1-3' or '1,3')",
    "If an issue spans multiple lines, use the starting line number",
    "The 'text' field should be clear, specific, and actionable WITHOUT including severity prefix",
    "Do NOT include [CRITICAL], [WARNING], or [SUGGESTION] in the text field",
    "Focus on issues that impact production: bugs, security, performance, maintainability",
    "Maximum 3-5 comments per file to avoid review fatigue",
    "Only flag issues that would cause problems in production or significantly impact code quality",
    "AVOID generic statements like 'ensure', 'make sure', 'consider', 'should'. Be specific about WHAT is wrong and WHY",
    "Do NOT suggest obvious best practices that are already being followed in the code",
    "Only comment on actual problems found in the diff, not on what could theoretically go wrong",
    "If the code already handles edge cases, error handling, or validation, do NOT suggest adding them again",
    "CRITICAL: When flagging removed functions/variables, ONLY comment if you can see they are actually used in the diff",
    "Do NOT suggest checking for references elsewhere - you cannot see the entire codebase, only this diff",
    "If a function is removed but you cannot see it being called in the diff, do NOT flag it as a problem",
    "Only flag actual ReferenceErrors if the removed code is clearly called in the visible diff"
  ],

  reviewGuidelines: {
    bugsAndLogicErrors: [
      "Incorrect logic, broken conditions, missing dependencies",
      "Null/undefined risks, off-by-one errors, race conditions, type mismatches",
      "Missing error handling, uncaught exceptions, unhandled promise rejections",
      "Edge cases not covered (empty arrays, null values, boundary conditions)",
      "Incorrect API usage or library misuse",
      "Uninitialized variables or implicit global declarations"
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
    ],

    cssAndStyling: [
      "Unused CSS rules or selectors",
      "Overly specific selectors causing maintainability issues",
      "Missing vendor prefixes for browser compatibility",
      "Performance issues (expensive selectors, too many media queries)",
      "Accessibility issues (insufficient color contrast, missing focus states)",
      "Hardcoded colors/values instead of using variables/tokens",
      "Duplicate styles that should be consolidated",
      "Improper use of !important (should be avoided)",
      "Missing responsive design considerations"
    ]
  },

  commentingRules: {
    critical: "Production-breaking bugs, security vulnerabilities, data loss risks, crashes, unhandled errors",
    warning: "Performance issues, architectural concerns, maintainability problems, potential bugs",
    suggestion: "Minor improvements, code style, documentation, nice-to-haves",
    guidelines: [
      "Be specific: Reference exact line numbers, variable names, or function names",
      "Be constructive: Suggest a specific fix or improvement when possible",
      "Be concise: Keep comments focused and avoid unnecessary verbosity",
      "Explain impact: Why this matters for production, performance, or maintainability",
      "Avoid nitpicking: Focus on issues that significantly impact code quality",
      "Consider context: Is this a library, API, frontend, or backend code?",
      "Flag gaps: Missing tests, error handling, or edge case coverage ONLY if not already present",
      "Highlight risks: Potential future maintenance issues or technical debt",
      "Write text field as a clear, actionable comment WITHOUT severity prefix",
      "Format: Start with the issue, explain why it matters, suggest a fix",
      "Example GOOD: 'Variables A, B, and C are implicitly declared as global variables. This causes scope pollution and breaks in strict mode. Use const or let to declare them explicitly.'",
      "Example BAD: 'Bad variable declaration' or 'Fix this' (too vague)",
      "Example BAD: 'Ensure proper error handling' (too generic - only flag if error handling is actually missing)",
      "Example BAD: 'Make sure to validate input' (too generic - only flag if validation is actually missing)",
      "NEVER suggest adding something that is already present in the code",
      "NEVER use vague language like 'ensure', 'make sure', 'consider', 'should' - be specific about what is wrong"
    ]
  }
};

