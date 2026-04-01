import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { RepoGrid } from "@/components/home/RepoGrid"
import { CustomRepoInput } from "@/components/home/CustomRepoInput"
import { ModeSelector } from "@/components/home/ModeSelector"
import { CURATED_REPOS } from "@/lib/repos"
import { loadSettings, saveSettings } from "@/lib/settings"
import type { Duration, TestMode } from "@/types"

export function HomePage() {
  const navigate = useNavigate()

  const [selectedRepo, setSelectedRepo] = useState<string | null>(
    () => loadSettings().repo,
  )
  const [mode, setMode] = useState<TestMode>(() => loadSettings().mode)
  const [duration, setDuration] = useState<Duration>(() => loadSettings().duration)

  function handleRepoChange(repo: string) {
    setSelectedRepo(repo)
    saveSettings({ ...loadSettings(), repo, mode, duration })
  }

  function handleModeChange(newMode: TestMode) {
    setMode(newMode)
    saveSettings({ ...loadSettings(), repo: selectedRepo, mode: newMode, duration })
  }

  function handleDurationChange(newDuration: Duration) {
    setDuration(newDuration)
    saveSettings({ ...loadSettings(), repo: selectedRepo, mode, duration: newDuration })
  }

  function handleStart() {
    if (!selectedRepo) return
    const params = new URLSearchParams({ repo: selectedRepo, mode, duration: String(duration) })
    navigate(`/test?${params.toString()}`)
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">TypeCode</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Type real code from popular open-source repositories
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Choose a repository
          </h2>
          <RepoGrid
            repos={CURATED_REPOS}
            selected={selectedRepo}
            onSelect={handleRepoChange}
          />
          <div className="pt-1">
            <p className="text-xs text-muted-foreground mb-2">
              Or use a custom GitHub repository:
            </p>
            <CustomRepoInput onSelect={handleRepoChange} selected={selectedRepo} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Test mode
          </h2>
          <ModeSelector
            mode={mode}
            duration={duration}
            onModeChange={handleModeChange}
            onDurationChange={handleDurationChange}
          />
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={!selectedRepo}
          onClick={handleStart}
        >
          {selectedRepo ? "Start typing" : "Select a repository to start"}
        </Button>

        <div className="text-center">
          <button
            onClick={() => navigate("/history")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            View history
          </button>
        </div>
      </div>

      <footer className="mt-8 pb-6 text-center space-y-1">
        <p className="text-xs text-muted-foreground/50">
          made by{" "}
          <a
            href="https://github.com/bouteillerAlan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            bouteillerAlan
          </a>
        </p>
        <p className="text-xs text-muted-foreground/50">
          <a
            href="https://github.com/bouteillerAlan/type"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline underline-offset-2"
          >
            check the code on GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
