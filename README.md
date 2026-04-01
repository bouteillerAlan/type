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

## Configuration

| Setting | Where | Description |
|---|---|---|
| Repository | Home page | Curated list or custom GitHub URL |
| Test mode | Home page | Timed or snippet completion |
| Duration | Home page | 15 / 30 / 60 / 120 seconds (timed mode only) |
| Font size | Test page | 14 / 16 / 20 / 24 / 28 / 32 px |
| Theme | Top-right toggle | Light / Dark / System (also togglable with `d`) |
| GitHub token | Auto-prompted | Stored in `localStorage` under `typecode-github-token` |

## Tech stack

- [React 19](https://react.dev/) + [React Router](https://reactrouter.com/)
- [Vite](https://vite.dev/)
- [Shiki](https://shiki.style/) for syntax highlighting
- [Recharts](https://recharts.org/) for charts
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- GitHub REST API (browser-side, CORS)

## Want to participate? Have a bug or a feature request?

Open a PR or an issue — contributions are welcome.
