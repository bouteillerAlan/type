import type { Duration, TestMode } from "@/types"

interface Props {
  cpm: number
  rawCpm: number
  accuracy: number
  remaining: number
  elapsed: number
  mode: TestMode
  duration: Duration
  started: boolean
  keyHistory: string[]
  keyCounts: Record<string, number>
}

export function StatsBar({
  cpm,
  rawCpm,
  accuracy,
  remaining,
  elapsed,
  mode,
  duration,
  started,
  keyHistory,
  keyCounts,
}: Props) {
  const timeDisplay = mode === "timed" ? remaining : elapsed
  const timeLabel = mode === "timed" ? "remaining" : "elapsed"

  return (
    <div className="flex items-center gap-8 font-mono text-sm mb-6">
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-primary">
          {started ? cpm : "—"}
        </span>
        <span className="text-xs text-muted-foreground">cpm</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-primary/60">
          {started ? rawCpm : "—"}
        </span>
        <span className="text-xs text-muted-foreground">raw</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-primary">
          {started ? `${accuracy}%` : "—"}
        </span>
        <span className="text-xs text-muted-foreground">accuracy</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold tabular-nums text-primary">
          {mode === "timed" && !started ? duration : timeDisplay}
          <span className="text-base font-normal">s</span>
        </span>
        <span className="text-xs text-muted-foreground">{timeLabel}</span>
      </div>

      <div className="flex items-end gap-1.5 ml-2">
        {Array.from({ length: 4 }, (_, i) => {
          const key = keyHistory[i]
          const count = key ? (keyCounts[key] ?? 0) : null
          return (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] tabular-nums text-muted-foreground/60 leading-none h-3">
                {count !== null ? count : ""}
              </span>
              <span
                className={`
                  w-7 h-7 flex items-center justify-center rounded border text-xs font-bold leading-none
                  ${key ? "border-primary/40 text-primary bg-primary/10" : "border-border/30 text-transparent"}
                `}
              >
                {key ?? "·"}
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
