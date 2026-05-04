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
  try {
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
            body: text,
          },
        ],
      })
    );
    return true; // Successfully posted
  } catch (error) {
    // GitHub API error when line is not in diff
    const errorMessage = error.message || '';
    const errorStatus = error.status || 0;
    
    // Check for "not part of the diff" error (422 Unprocessable Entity)
    if (
      errorStatus === 422 ||
      errorMessage.includes('not part of the diff') ||
      errorMessage.includes('not in the diff') ||
      errorMessage.includes('outside the diff')
    ) {
      core.warning(`Comment on ${filename}:${line} skipped - line not changed in this PR`);
      return false; // Skip this comment
    }
    
    // Re-throw other errors
    throw error;
  }
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
  let skippedCount = 0;

  for (const comment of comments) {
    try {
      const posted = await postReviewComment(
        octokit,
        owner,
        repo,
        prNumber,
        filename,
        comment.line,
        comment.text
      );
      
      if (posted !== false) {
        postedCount++;
      } else {
        skippedCount++;
      }
      
      await sleep(CONFIG.COMMENT_DELAY_MS);
    } catch (error) {
      core.warning(`Failed to post comment on ${filename}:${comment.line}: ${error.message}`);
      skippedCount++;
    }
  }

  return { postedCount, skippedCount };
};

module.exports = {
  getOctokit,
  getPRFiles,
  postReviewComment,
  extractPRInfo,
  postReviewComments,
};
