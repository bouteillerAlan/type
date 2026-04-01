const TOKEN_KEY = "typecode-github-token"

export class RateLimitError extends Error {
  constructor() {
    super("GitHub API rate limit reached.")
    this.name = "RateLimitError"
  }
}

export function getGithubToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function saveGithubToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token.trim()) } catch { /* noop */ }
}

function authHeaders(): HeadersInit {
  const token = getGithubToken()
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const ALLOWED_EXTENSIONS = new Set([
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".js",
  ".mjs",
  ".ts",
  ".tsx",
  ".py",
  ".go",
  ".sh",
  ".zsh",
  ".rs",
  ".java",
])

export const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".hpp": "cpp",
  ".js": "javascript",
  ".mjs": "javascript",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".py": "python",
  ".go": "go",
  ".sh": "shellscript",
  ".zsh": "shellscript",
  ".rs": "rust",
  ".java": "java",
}

const MAX_FILE_SIZE = 100_000

export interface GitHubTreeItem {
  path: string
  type: string
  size?: number
  sha: string
  url: string
}

export function validateRepoSlug(
  slug: string,
): { owner: string; name: string } | null {
  const match = /^([a-zA-Z0-9._-]{1,100})\/([a-zA-Z0-9._-]{1,100})$/.exec(
    slug,
  )
  if (!match) return null
  return { owner: match[1], name: match[2] }
}

export function extname(path: string): string {
  const i = path.lastIndexOf(".")
  if (i === -1 || i === path.length - 1) return ""
  return path.slice(i)
}

export async function fetchFileTree(
  owner: string,
  name: string,
): Promise<GitHubTreeItem[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/git/trees/HEAD?recursive=1`,
    { headers: authHeaders() },
  )
  if (!res.ok) {
    if (res.status === 403 || res.status === 429) throw new RateLimitError()
    if (res.status === 404) throw new Error(`Repository ${owner}/${name} not found`)
    throw new Error(`GitHub API error: ${res.status}`)
  }
  const data = await res.json()
  return data.tree as GitHubTreeItem[]
}

export function pickRandomFile(items: GitHubTreeItem[]): GitHubTreeItem {
  const candidates = items.filter(
    (item) =>
      item.type === "blob" &&
      item.size !== undefined &&
      item.size <= MAX_FILE_SIZE &&
      ALLOWED_EXTENSIONS.has(extname(item.path)),
  )
  if (candidates.length === 0) throw new Error("No suitable code files found in this repository")
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export async function fetchFileContent(
  owner: string,
  name: string,
  path: string,
): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/contents/${path}`,
    { headers: authHeaders() },
  )
  if (!res.ok) {
    if (res.status === 403 || res.status === 429) throw new RateLimitError()
    throw new Error(`Failed to fetch file: ${res.status}`)
  }
  const data = await res.json()
  // GitHub returns base64 encoded content with newlines
  const decoded = atob(data.content.replace(/\n/g, ""))
  return decoded
}

// Matches top-level declaration starts across common languages
const DECLARATION_RE =
  /^(export |import |from |const |let |var |function |async function |class |interface |type |enum |def |async def |func |fn |impl |pub |struct |trait |use |mod |package |#include|#define|#pragma|[A-Za-z_]\w*\s+\w+\s*\()/

// Matches lines that are purely comments (any language)
const COMMENT_RE = /^(\/\/|\/\*|\*\s|\*$|#[^!]|<!--)/

function isComment(line: string): boolean {
  return COMMENT_RE.test(line.trimStart())
}

function isValidStart(line: string): boolean {
  if (line.length <= 2) return false
  if (/^\s/.test(line)) return false             // indented
  if (/^[{});\]]+$/.test(line.trim())) return false // only brackets
  if (isComment(line)) return false
  return true
}

function findDeclarationLine(lines: string[], from: number): number {
  // Scan the whole file for valid declaration starts, prefer closest to `from`
  const candidates: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (isValidStart(lines[i]) && DECLARATION_RE.test(lines[i])) {
      candidates.push(i)
    }
  }

  if (candidates.length > 0) {
    const afterFrom = candidates.filter((i) => i >= from)
    if (afterFrom.length > 0) return afterFrom[0]
    return candidates[candidates.length - 1]
  }

  // Fall back: any non-indented, non-comment, non-trivial line
  for (let i = from; i < lines.length; i++) {
    if (isValidStart(lines[i])) return i
  }
  for (let i = from - 1; i >= 0; i--) {
    if (isValidStart(lines[i])) return i
  }

  return from
}

function stripLeadingCommentLines(lines: string[]): string[] {
  let i = 0
  while (i < lines.length && (lines[i].trim() === "" || isComment(lines[i]))) {
    i++
  }
  return i < lines.length ? lines.slice(i) : lines
}

export function pickRandomChunk(
  lines: string[],
  mode: "timed" | "snippet",
  duration = 60,
): string {
  // Scale line count: ~50 lines/min baseline for timed, fixed 80 for snippet
  // Add 50% buffer so fast typists (200+ cpm) don't run out
  const targetLines = mode === "snippet" ? 80 : Math.round((duration / 60) * 80)

  // Trim leading/trailing blank lines from the full file
  let start = 0
  let end = lines.length - 1
  while (start < end && lines[start].trim() === "") start++
  while (end > start && lines[end].trim() === "") end--

  const usable = lines.slice(start, end + 1)

  if (usable.length <= targetLines) {
    return stripLeadingCommentLines(usable).join("\n")
  }

  // Pick a random candidate start, then snap to the nearest declaration
  const maxStart = usable.length - targetLines
  const candidate = Math.floor(Math.random() * maxStart)
  const declarationStart = findDeclarationLine(usable, candidate)

  let chunk = usable.slice(declarationStart, declarationStart + targetLines)
  if (chunk.length === 0) chunk = usable.slice(candidate, candidate + targetLines)

  return stripLeadingCommentLines(chunk).join("\n")
}
