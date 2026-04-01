import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { CuratedRepo } from "@/lib/repos"

interface Props {
  repos: CuratedRepo[]
  selected: string | null
  onSelect: (slug: string) => void
}

const LANG_COLORS: Record<string, string> = {
  c: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cpp: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ts: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  tsx: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  js: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  sh: "bg-green-500/10 text-green-400 border-green-500/20",
  go: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  python: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  rust: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  java: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function RepoGrid({ repos, selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {repos.map((repo) => {
        const isSelected = selected === repo.slug
        return (
          <button
            key={repo.slug}
            onClick={() => onSelect(repo.slug)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card",
            )}
          >
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-mono border",
                LANG_COLORS[repo.lang] ?? "",
              )}
            >
              {repo.lang}
            </Badge>
            <div>
              <div className="font-medium text-sm leading-tight">
                {repo.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {repo.description}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
