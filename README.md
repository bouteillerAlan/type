<h1 align="center">TypeCode</h1>
<p align="center"><i>A Monkeytype-style typing speed test — but for real code.</i></p>

## Description

TypeCode lets you practice typing speed using actual source code from popular open-source GitHub repositories. No random words, no lorem ipsum — just real, syntax-highlighted code pulled live from GitHub.

### Main features

- type real code from well-known repos (Linux, React, TypeScript, Go, CPython, and more)
- paste any public GitHub repository URL to use as a source
- two test modes: **timed** (15 / 30 / 60 / 120 s) and **snippet** (complete a full chunk)
- syntax highlighting that follows your light/dark theme, powered by [Shiki](https://shiki.style/)
- tracks **CPM** (characters per minute) and accuracy
- per-session performance graph (CPM over time + errors per second)
- history page with a CPM trend chart and personal best highlight
- previous-session comparison shown right after each test
- keyboard heatmap per session and across all sessions
- font size selector on the test page
- **Reload** button to fetch a new snippet without leaving the page
- **End** button (snippet mode) to stop and save the current session early
- scroll keeps 4 lines of upcoming code visible below the cursor
- all settings and results persisted to `localStorage` — no account needed
- GitHub personal access token support to bypass the 60 req/hour anonymous rate limit

### Fully static

No server, no backend, no account. Every GitHub API call happens directly in the browser (the GitHub REST API supports CORS). Deploy anywhere that serves static files.

## Installation

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build
npm run preview
```

## Usage

1. Pick a repository from the grid — or paste a custom GitHub URL.
2. Choose a mode (timed or snippet) and a duration.
3. Click **Start typing** and go.
4. When the test ends, a results card shows your CPM, accuracy, and a performance graph.
5. Browse all past sessions on the **History** page.

### Rate limiting

Anonymous GitHub API access is limited to 60 requests/hour. If you hit the limit, TypeCode will show a step-by-step guide to create a free personal access token (no scopes needed for public repos) and store it locally.

## Code of conduct, license, contributing

See the following file :
- [code of conduct](CODE_OF_CONDUCT.md)
- [license](LICENSE)
- [contributing](CONTRIBUTING.md)
- [security](SECURITY.md)

## Want to participate? Have a bug or a request feature?

Do not hesitate to open a pr or an issue. I reply when I can.

## Want to support my work?

- [Give me a tips](https://ko-fi.com/a2n00)
- [Give a star on github](https://github.com/bouteillerAlan/type)
- Or just participate to the development :D

### Thanks !
