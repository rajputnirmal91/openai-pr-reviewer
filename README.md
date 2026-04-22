# OpenAI PR Reviewer

An automated GitHub Action that reviews pull requests using OpenAI and posts inline comments.

## Usage

```yaml
- uses: rajputnirmal91/openai-pr-reviewer@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    model: 'gpt-4'
    max-files: '10'
