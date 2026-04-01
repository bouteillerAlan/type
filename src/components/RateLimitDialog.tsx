import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { saveGithubToken } from "@/lib/github"

interface Props {
  open: boolean
  onTokenSaved: () => void
}

const STEPS = [
  <>Go to <strong>github.com</strong> and sign in.</>,
  <>Click your avatar → <strong>Settings</strong>.</>,
  <>Scroll to <strong>Developer settings</strong> (bottom of the left sidebar).</>,
  <>Select <strong>Personal access tokens → Tokens (classic)</strong>.</>,
  <>Click <strong>Generate new token (classic)</strong>.</>,
  <>Give it a name (e.g. <em>TypeCode</em>) and set an expiry. <strong>No scopes needed</strong> — public repos are accessible without permissions.</>,
  <>Click <strong>Generate token</strong>, copy it, and paste it below.</>,
]

export function RateLimitDialog({ open, onTokenSaved }: Props) {
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const trimmed = token.trim()
    if (!trimmed) { setError("Please paste your token."); return }
    if (!/^gh[ps]_[A-Za-z0-9]{36,}$/.test(trimmed) && !/^github_pat_/.test(trimmed)) {
      setError("That doesn't look like a valid GitHub token.")
      return
    }
    saveGithubToken(trimmed)
    setToken("")
    setError(null)
    onTokenSaved()
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>GitHub API rate limit reached</DialogTitle>
          <DialogDescription>
            Anonymous requests are limited to 60/hour. Add a personal access
            token to get 5 000/hour instead.
          </DialogDescription>
        </DialogHeader>

        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          {STEPS.map((step, i) => (
            <li key={i} className="leading-relaxed">{step}</li>
          ))}
        </ol>

        <div className="space-y-2 pt-1">
          <Input
            value={token}
            onChange={(e) => { setToken(e.target.value); setError(null) }}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="font-mono text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button className="w-full" onClick={handleSave}>
            Save token and retry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
