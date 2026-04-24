const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildReviewPrompt } = require('./reviewPrompt');

async function run() {
  try {
    // Inputs from GitHub Action
    const token = process.env.INPUT_GITHUB_TOKEN;
    const aiKey = process.env.INPUT_AI_API_KEY;
    const modelName = process.env.INPUT_MODEL || 'gemini-1.5-flash';
    const maxFiles = parseInt(process.env.INPUT_MAX_FILES) || 10;

    // Validate inputs
    if (!token) {
      throw new Error('github-token is required');
    }
    if (!aiKey) {
      throw new Error('gemini-api-key is required');
    }

    core.info(`Using model: ${modelName}, max files: ${maxFiles}`);

    const octokit = github.getOctokit(token);

    // Gemini setup
    const genAI = new GoogleGenerativeAI(aiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const { context } = github;

    if (context.eventName !== 'pull_request') {
      core.info('Not a pull request event, skipping');
      return;
    }

    const pr = context.payload.pull_request;
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const prNumber = pr.number;

    core.info(`Reviewing PR #${prNumber}`);

    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    if (files.length > maxFiles) {
      core.warning(`Too many files (${files.length}), reviewing only ${maxFiles}`);
    }

    for (const file of files.slice(0, maxFiles)) {
      if (!file.patch) continue;

      const review = await reviewCode(model, file.patch, file.filename);

      if (review.comments && review.comments.length > 0) {
        for (const comment of review.comments) {
          await octokit.rest.pulls.createReview({
            owner,
            repo,
            pull_number: prNumber,
            event: 'COMMENT',
            comments: [
              {
                path: file.filename,
                line: comment.line || 1,
                body: comment.text,
              },
            ],
          });

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    core.info('PR review completed');
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function reviewCode(model, patch, filename) {
  try {
    const prompt = `You are a senior full-stack engineer performing a strict production-level code review.

Analyze the following Git diff and return ONLY valid JSON in the exact format below:

{
"comments": [
{ "line": number, "severity": "critical | warning | suggestion", "category": "bug | performance | security | readability | architecture | best_practice", "text": "clear, specific, and actionable review comment" }
]
}

Rules:

* ONLY return valid JSON (no markdown, no explanations outside JSON)
* Do NOT include any text before or after JSON
* Each comment must be precise and actionable
* Do NOT repeat similar comments
* If no issues, return: { "comments": [] }

Review Guidelines:

1. Bugs & Logic Errors

* Incorrect logic, broken conditions, missing dependencies
* React hook misuse (useEffect, useMemo, useCallback issues)

2. React Best Practices

* Unnecessary re-renders
* Missing keys in lists
* Improper state management
* Anti-patterns in component design

3. Performance

* Expensive computations inside render
* Missing memoization where needed
* Inefficient rendering patterns

4. Security

* XSS risks (dangerouslySetInnerHTML, unsafe inputs)
* Exposure of sensitive data
* Unsafe API usage

5. Readability & Maintainability

* Poor naming
* Large or complex components
* Duplicate logic

6. Architecture & Scalability

* Tight coupling
* Poor separation of concerns
* Non-reusable patterns

7. Edge Cases & Error Handling

* Missing loading/error states
* Undefined/null risks

Commenting Rules:

* Use "critical" for bugs, security issues, or breaking problems
* Use "warning" for performance or architectural concerns
* Use "suggestion" for minor improvements
* Reference the exact issue clearly
* Suggest a fix when possible

File: ${filename}

Diff:
${patch}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean possible markdown wrappers
    text = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(text);
  } catch (error) {
    core.warning(`Failed to review code: ${error.message}`);
    return { comments: [] };
  }
}

run();
