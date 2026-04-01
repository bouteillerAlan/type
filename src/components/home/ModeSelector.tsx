import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Duration, TestMode } from "@/types"

const DURATIONS: Duration[] = [15, 30, 60, 120]

interface Props {
  mode: TestMode
  duration: Duration
  onModeChange: (mode: TestMode) => void
  onDurationChange: (d: Duration) => void
}

export function ModeSelector({
  mode,
  duration,
  onModeChange,
  onDurationChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-md border border-border overflow-hidden">
        <button
          onClick={() => onModeChange("timed")}
          className={cn(
            "px-3 py-1.5 text-sm transition-colors",
            mode === "timed"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          timed
        </button>
        <button
          onClick={() => onModeChange("snippet")}
          className={cn(
            "px-3 py-1.5 text-sm transition-colors border-l border-border",
            mode === "snippet"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          snippet
        </button>
      </div>

      {mode === "timed" && (
        <div className="flex items-center gap-1">
          {DURATIONS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={duration === d ? "default" : "ghost"}
              onClick={() => onDurationChange(d)}
              className="font-mono w-12"
            >
              {d}s
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
