const core = require('@actions/core');
const github = require('@actions/github');
const { retryWithBackoff, sleep } = require('../utils/helpers');
const { validatePRContext } = require('../utils/validators');
const { CONFIG } = require('../utils/constants');

/**
 * Get GitHub Octokit client
 */
const getOctokit = (token) => {
  return github.getOctokit(token);
};

/**
 * Get PR files to review
 */
const getPRFiles = async (octokit, owner, repo, prNumber) => {
  const { data: files } = await retryWithBackoff(() =>
    octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    })
  );

  return files || [];
};

/**
 * Post review comment on PR
 */
const postReviewComment = async (octokit, owner, repo, prNumber, filename, line, text, severity) => {
  await retryWithBackoff(() =>
    octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      event: 'COMMENT',
      comments: [
        {
          path: filename,
          line,
          body: `[${severity.toUpperCase()}] ${text}`,
        },
      ],
    })
  );
};

/**
 * Extract PR information from context
 */
const extractPRInfo = (context) => {
  const pr = validatePRContext(context);

  return {
    owner: context.repo.owner,
    repo: context.repo.repo,
    prNumber: pr.number,
  };
};

/**
 * Process and post all review comments
 */
const postReviewComments = async (octokit, owner, repo, prNumber, filename, comments) => {
  let postedCount = 0;

  for (const comment of comments) {
    try {
      await postReviewComment(
        octokit,
        owner,
        repo,
        prNumber,
        filename,
        comment.line,
        comment.text,
        comment.severity
      );
      postedCount++;
      await sleep(CONFIG.COMMENT_DELAY_MS);
    } catch (error) {
      core.warning(`Failed to post comment on ${filename}: ${error.message}`);
    }
  }

  return postedCount;
};

module.exports = {
  getOctokit,
  getPRFiles,
  postReviewComment,
  extractPRInfo,
  postReviewComments,
};
