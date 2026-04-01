import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getStoredResults } from "@/lib/stats"
import { KeyboardHeatmap } from "@/components/KeyboardHeatmap"
import type { StoredResult } from "@/types"

const chartConfig = {
  cpm: { label: "CPM", color: "var(--chart-1)" },
  rawCpm: { label: "Raw CPM", color: "var(--chart-3)" },
  errors: { label: "Errors", color: "var(--chart-2)" },
} satisfies ChartConfig

export function HistoryPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState<StoredResult[]>(() =>
    getStoredResults().slice().reverse(),
  )

  function handleClear() {
    if (!confirm("Delete all session history? This cannot be undone.")) return
    localStorage.removeItem("typecode-results")
    setResults([])
  }

  const pbId = results.length > 0
    ? results.reduce((best, r) => r.cpm > best.cpm ? r : best, results[0]).id
    : null

  const aggregateKeyCounts = results.reduce<Record<string, number>>((acc, r) => {
    if (!r.keyCounts) return acc
    for (const [key, count] of Object.entries(r.keyCounts)) {
      acc[key] = (acc[key] ?? 0) + count
    }
    return acc
  }, {})

  const chartData = results
    .slice()
    .reverse()
    .map((r, i) => ({
      index: i + 1,
      cpm: r.cpm,
      rawCpm: r.rawCpm ?? r.cpm,
      errors: r.incorrect,
      label: new Date(r.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }))

  return (
    <div className="min-h-svh flex flex-col p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span>Back to home</span>
        </button>
        <h1 className="text-xl font-bold">History</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-destructive hover:text-destructive"
          disabled={results.length === 0}
        >
          Clear all
        </Button>
      </div>

      {results.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          No sessions recorded yet.
        </div>
      ) : (
        <div className="space-y-8">
          {/* CPM trend chart */}
          {chartData.length > 1 && (
            <div>
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                CPM over time ({chartData.length} sessions)
              </p>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="index" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="cpm" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
                  <YAxis yAxisId="errors" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          (payload?.[0]?.payload as { label?: string })?.label ?? ""
                        }
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    yAxisId="cpm"
                    type="monotone"
                    dataKey="cpm"
                    stroke="var(--color-cpm)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-cpm)" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    yAxisId="cpm"
                    type="monotone"
                    dataKey="rawCpm"
                    stroke="var(--color-rawCpm)"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Bar
                    yAxisId="errors"
                    dataKey="errors"
                    fill="var(--color-errors)"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={12}
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          )}

          {/* Aggregate keyboard heatmap */}
          {Object.keys(aggregateKeyCounts).length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                All-time key heatmap ({results.length} sessions)
              </p>
              <KeyboardHeatmap keyCounts={aggregateKeyCounts} />
            </div>
          )}

          {/* Personal best */}
          {pbId && (() => {
            const pb = results.find(r => r.id === pbId)!
            return (
              <div>
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                  Personal best
                </p>
                <SessionRow result={pb} rank={results.length - results.indexOf(pb)} isPb />
              </div>
            )
          })()}

          {/* Session list */}
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
              All sessions
            </p>
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {results.map((r, i) => (
                <SessionRow key={r.id} result={r} rank={results.length - i} isPb={r.id === pbId} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SessionRow({ result, rank, isPb }: { result: StoredResult; rank: number; isPb?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const hasKeyboard = result.keyCounts && Object.keys(result.keyCounts).length > 0

  const date = new Date(result.timestamp)
  const timeStr = date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const baseClass = isPb
    ? "bg-yellow-500/10 border border-yellow-500/30"
    : "bg-muted/30 border border-transparent"

  return (
    <div className={`rounded-md font-mono text-sm transition-colors ${baseClass}`}>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 ${hasKeyboard ? "cursor-pointer hover:bg-white/5" : ""}`}
        onClick={() => hasKeyboard && setExpanded((v) => !v)}
      >
        <span className={`w-6 text-xs shrink-0 ${isPb ? "text-yellow-500" : "text-muted-foreground"}`}>
          {isPb ? "♛" : `#${rank}`}
        </span>
        <span className="w-32 shrink-0 text-xs text-muted-foreground">{timeStr}</span>
        <span className={`w-20 shrink-0 font-semibold ${isPb ? "text-yellow-500" : "text-primary"}`}>{result.cpm} cpm</span>
        <span className="w-14 shrink-0 text-muted-foreground">{result.accuracy}%</span>
        <span className="w-12 shrink-0 text-xs text-muted-foreground">{result.duration}s</span>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Badge variant="secondary" className="text-xs shrink-0">{result.mode}</Badge>
          <span className="truncate text-xs text-muted-foreground">{result.repo}</span>
        </div>
        {hasKeyboard && (
          <ChevronDown
            className={`shrink-0 w-3.5 h-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {expanded && result.keyCounts && (
        <div className="px-4 pb-4 pt-1">
          <KeyboardHeatmap keyCounts={result.keyCounts} />
        </div>
      )}
    </div>
  )
}
