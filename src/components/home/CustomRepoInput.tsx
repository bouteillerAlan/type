import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const GITHUB_URL_RE =
  /^https:\/\/github\.com\/([a-zA-Z0-9._-]{1,100})\/([a-zA-Z0-9._-]{1,100})\/?$/

interface Props {
  onSelect: (slug: string) => void
  selected: string | null
}

export function CustomRepoInput({ onSelect, selected }: Props) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    const match = GITHUB_URL_RE.exec(trimmed)
    if (!match) {
      setError("Enter a valid GitHub URL: https://github.com/owner/repo")
      return
    }
    setError(null)
    onSelect(`${match[1]}/${match[2]}`)
  }

  const isCustomSelected =
    selected !== null &&
    !selected.startsWith("torvalds") &&
    value.trim().includes(selected)

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          placeholder="https://github.com/owner/repo"
          className="font-mono text-sm"
          aria-label="Custom repository URL"
        />
        <Button type="submit" variant="outline" className="shrink-0">
          Use repo
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {isCustomSelected && (
        <p className="text-xs text-primary">
          Using custom repo: {selected}
        </p>
      )}
    </form>
  )
}
