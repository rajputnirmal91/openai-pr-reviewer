const core = require('@actions/core');
const github = require('@actions/github');
const { validateEnvironment } = require('./utils/validators');
const { CONFIG } = require('./utils/constants');
const { initializeModel } = require('./controllers/modelController');
const { getOctokit, getPRFiles, extractPRInfo, postReviewComments } = require('./controllers/githubController');
const { reviewCode } = require('./controllers/reviewController');

/**
 * Main entry point for PR review
 */
const run = async () => {
  try {
    // Get environment variables
    const token = process.env.INPUT_GITHUB_TOKEN;
    const aiKey = process.env.INPUT_AI_API_KEY;
    const modelName = process.env.INPUT_MODEL || CONFIG.DEFAULT_MODEL;
    const ollamaUrl = process.env.INPUT_OLLAMA_URL || CONFIG.OLLAMA_URL;
    const maxFilesInput = process.env.INPUT_MAX_FILES || CONFIG.DEFAULT_MAX_FILES;

    // Validate environment
    const maxFiles = validateEnvironment(token, aiKey, maxFilesInput);

    core.info(`Using Ollama model: ${modelName}, URL: ${ollamaUrl}, max files: ${maxFiles}`);

    // Initialize clients
    const octokit = getOctokit(token);
    const model = initializeModel(aiKey, modelName, ollamaUrl);
    const { context } = github;

    // Check if this is a PR event
    if (context.eventName !== 'pull_request') {
      core.info('Not a pull request event, skipping');
      return;
    }

    // Extract PR information
    const { owner, repo, prNumber } = extractPRInfo(context);
    core.info(`Reviewing PR #${prNumber}`);

    // Get files to review
    const files = await getPRFiles(octokit, owner, repo, prNumber);

    if (files.length === 0) {
      core.info(CONFIG.NO_FILES_TO_REVIEW);
      return;
    }

    if (files.length > maxFiles) {
      core.warning(`Too many files (${files.length}), reviewing only ${maxFiles}`);
    }

    // Review files and post comments
    let reviewedCount = 0;
    let totalComments = 0;
    let skippedComments = 0;

    for (const file of files.slice(0, maxFiles)) {
      if (!file.patch) {
        core.debug(`Skipping ${file.filename}: no patch content`);
        continue;
      }

      core.info(`Reviewing ${file.filename}`);

      const review = await reviewCode(model, file.patch, file.filename);

      if (review.comments && review.comments.length > 0) {
        const result = await postReviewComments(
          octokit,
          owner,
          repo,
          prNumber,
          file.filename,
          review.comments
        );
        totalComments += result.postedCount;
        skippedComments += result.skippedCount;
      }

      reviewedCount++;
    }

    core.info(`PR review completed: ${reviewedCount} files reviewed, ${totalComments} comments posted${skippedComments > 0 ? `, ${skippedComments} skipped (not in diff)` : ''}`);
  } catch (error) {
    core.setFailed(error.message);
  }
};

// Execute
run();
