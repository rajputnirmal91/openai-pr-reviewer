# Ollama PR Reviewer

An automated GitHub Action that reviews pull requests using Ollama and posts inline comments.

## Usage

```yaml
- uses: rajputnirmal91/ollama-pr-reviewer@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    ai-api-key: ${{ secrets.OLLAMA_API_KEY }}
    ollama-url: 'https://ollama.jaihindji.in/'
    model: 'gpt-oss:20b-cloud'
    max-files: '10'
