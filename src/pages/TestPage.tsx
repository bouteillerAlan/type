import { useCallback, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import type { Duration, SnippetData, TestMode } from "@/types"
import { TypingTest } from "@/components/test/TypingTest"
import { RateLimitDialog } from "@/components/RateLimitDialog"
import {
  EXTENSION_TO_LANGUAGE,
  RateLimitError,
  extname,
  fetchFileContent,
  fetchFileTree,
  pickRandomChunk,
  pickRandomFile,
  validateRepoSlug,
} from "@/lib/github"
import { tokenizeCode } from "@/lib/shiki"

export function TestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const repo = searchParams.get("repo") ?? ""
  const mode: TestMode = searchParams.get("mode") === "snippet" ? "snippet" : "timed"
  const durRaw = Number(searchParams.get("duration"))
  const duration: Duration = ([15, 30, 60, 120] as Duration[]).includes(durRaw as Duration)
    ? (durRaw as Duration)
    : 60

  const [snippet, setSnippet] = useState<SnippetData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rateLimited, setRateLimited] = useState(false)
  const [testKey, setTestKey] = useState(0)

  const loadSnippet = useCallback(() => {
    const slug = validateRepoSlug(repo)
    if (!slug) { navigate("/"); return }

    setLoading(true)
    setSnippet(null)
    setError(null)
    setRateLimited(false)

    fetchFileTree(slug.owner, slug.name)
      .then((tree) => {
        const file = pickRandomFile(tree)
        return fetchFileContent(slug.owner, slug.name, file.path).then(
          (raw) => ({ raw, file }),
        )
      })
      .then(({ raw, file }) => {
        const lines = raw.split("\n")
        const code = pickRandomChunk(lines, mode, duration)
        const ext = extname(file.path)
        const lang = EXTENSION_TO_LANGUAGE[ext] ?? "javascript"
        const colorScheme = document.documentElement.classList.contains("dark")
          ? "dark"
          : "light"
        return tokenizeCode(code, lang, colorScheme).then((chars) => ({ chars, lang, file }))
      })
      .then(({ chars, lang, file }) => {
        setSnippet({ chars, language: lang, repo, filePath: file.path })
      })
      .catch((e: Error) => {
        if (e instanceof RateLimitError) {
          setRateLimited(true)
        } else {
          setError(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [repo, mode])

  useEffect(() => { loadSnippet() }, [loadSnippet])

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            Fetching code from{" "}
            <span className="font-mono text-foreground">{repo}</span>…
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-destructive font-medium">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <RateLimitDialog
        open={rateLimited}
        onTokenSaved={loadSnippet}
      />

      {snippet && (
        <div className="min-h-svh flex flex-col p-6">
          <div className="mb-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>←</span>
              <span>Back to home</span>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-[85%]">
              <TypingTest
                key={testKey}
                snippet={snippet}
                mode={mode}
                duration={duration}
                onRestart={() => { setTestKey((k) => k + 1); loadSnippet() }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
