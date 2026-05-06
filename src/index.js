const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const { buildReviewPrompt } = require('./reviewPrompt');

async function run() {
  try {
    // Inputs from GitHub Action
    const token = process.env.INPUT_GITHUB_TOKEN;
    const aiKey = process.env.INPUT_AI_API_KEY;
    const modelName = 'gpt-oss:20b-cloud'||  process.env.INPUT_MODEL;
    const maxFiles = parseInt(process.env.INPUT_MAX_FILES) || 10;
    const ollamaUrl = process.env.INPUT_OLLAMA_URL || 'https://ollama.jaihindji.in/';

    // Validate inputs
    if (!token) {
      throw new Error('github-token is required');
    }
    if (!aiKey) {
      throw new Error('ollama-api-key is required');
    }

    core.info(`Using Ollama model: ${modelName}, URL: ${ollamaUrl}, max files: ${maxFiles}`);

    const octokit = github.getOctokit(token);

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

      const review = await reviewCode(ollamaUrl, modelName, aiKey, file.patch, file.filename);

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

async function reviewCode(ollamaUrl, modelName, apiKey, patch, filename) {
  try {
    const prompt = buildReviewPrompt(filename, patch);

    const response = await axios.post(`${ollamaUrl}api/generate`, {
      model: modelName,
      prompt: prompt,
      stream: false,
    }, {
      headers: {
        // 'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    let text = response.data.response;

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
