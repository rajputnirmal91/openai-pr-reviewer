const core = require('@actions/core');
const github = require('@actions/github');
const { OpenAI } = require('openai');

async function run() {
  try {
    const token = core.getInput('github-token');
    const openaiKey = core.getInput('openai-api-key');
    const model = core.getInput('model');
    const maxFiles = parseInt(core.getInput('max-files')) || 10;
    
    const octokit = github.getOctokit(token);
    const openai = new OpenAI({ apiKey: openaiKey });
    
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
      if (file.patch) {
        const review = await reviewCode(openai, file.patch, file.filename, model);
        
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
    }
    
    core.info('PR review completed');
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function reviewCode(openai, patch, filename, model) {
  try {
    const message = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Review the provided code diff and identify issues, improvements, and best practices. Respond with JSON: { "comments": [{ "line": <number>, "text": "<review>" }] }',
        },
        {
          role: 'user',
          content: `Review this code change in file ${filename}:\n\n${patch}`,
        },
      ],
    });
    
    const content = message.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    core.warning(`Failed to review code: ${error.message}`);
    return { comments: [] };
  }
}

run();
