const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildReviewPrompt } = require('./reviewPrompt');

async function run() {
  try {
    // Inputs from GitHub Action
    const token = process.env.INPUT_GITHUB_TOKEN;
    const geminiKey = process.env.INPUT_OPENAI_API_KEY;
    const modelName = process.env.INPUT_MODEL || 'gemini-1.5-flash';
    const maxFiles = parseInt(process.env.INPUT_MAX_FILES) || 10;

    // Validate inputs
    if (!token) {
      throw new Error('github-token is required');
    }
    if (!geminiKey) {
      throw new Error('gemini-api-key is required');
    }

    core.info(`Using model: ${modelName}, max files: ${maxFiles}`);

    const octokit = github.getOctokit(token);

    // Gemini setup
    const genAI = new GoogleGenerativeAI(geminiKey);
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
    const prompt = buildReviewPrompt(filename, patch);

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
