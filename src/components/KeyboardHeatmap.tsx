const ROWS: string[][] = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "⌫"],
  ["⇥", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "↵"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ["⎵"],
]

const WIDE: Record<string, number> = {
  "⌫": 1.75,
  "⇥": 1.5,
  "↵": 2,
  "⎵": 8,
}

interface Props {
  keyCounts: Record<string, number>
}

export function KeyboardHeatmap({ keyCounts }: Props) {
  const maxCount = Math.max(1, ...Object.values(keyCounts))

  return (
    <div className="flex flex-col gap-1 items-center select-none font-mono">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map((key) => {
            const count = keyCounts[key] ?? 0
            const ratio = count / maxCount

            const bg =
              count > 0
                ? `color-mix(in srgb, var(--chart-1) ${Math.round(ratio * 100)}%, var(--chart-2))`
                : "hsl(var(--muted) / 0.35)"

            const fg =
              ratio > 0.55
                ? "hsl(var(--primary-foreground))"
                : count > 0
                ? "hsl(var(--secondary-foreground))"
                : "hsl(var(--muted-foreground) / 0.5)"

            const wide = WIDE[key]

            return (
              <div
                key={key}
                className="flex flex-col items-center justify-center rounded border border-border/30 leading-none transition-colors"
                style={{
                  width: wide ? `${wide * 28}px` : "28px",
                  height: "32px",
                  backgroundColor: bg,
                  color: fg,
                }}
              >
                <span className="text-[10px] font-semibold">{key}</span>
                {count > 0 && (
                  <span className="text-[7px] mt-0.5 opacity-80 tabular-nums">{count}</span>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
