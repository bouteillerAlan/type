import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { KeyboardHeatmap } from "@/components/KeyboardHeatmap"
import type { TestResult, TimePoint, StoredResult } from "@/types"

const chartConfig = {
  cpm: { label: "CPM", color: "var(--chart-1)" },
  rawCpm: { label: "Raw CPM", color: "var(--chart-3)" },
  errors: { label: "Errors", color: "var(--chart-2)" },
} satisfies ChartConfig

interface Props {
  result: TestResult
  timeline: TimePoint[]
  correctCount: number
  incorrectCount: number
  keyCounts: Record<string, number>
  prevSessions: StoredResult[]
  onRestart: () => void
  onHome: () => void
}

export function ResultsCard({
  result,
  timeline,
  correctCount,
  incorrectCount,
  keyCounts,
  prevSessions,
  onRestart,
  onHome,
}: Props) {
  const hasTimeline = timeline.length > 1

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl">Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Main stats */}
          <div className="grid grid-cols-4 gap-4 text-center font-mono">
            <Stat label="cpm" value={result.cpm} />
            <Stat label="raw" value={result.rawCpm} />
            <Stat label="accuracy" value={`${result.accuracy}%`} />
            <Stat label="time" value={`${result.duration}s`} />
          </div>

          {/* Correct / incorrect breakdown */}
          <div className="grid grid-cols-3 gap-3 text-center font-mono text-sm">
            <div className="rounded-md bg-muted/50 p-2">
              <div className="text-xl font-semibold text-green-500">{correctCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">correct</div>
            </div>
            <div className="rounded-md bg-muted/50 p-2">
              <div className="text-xl font-semibold text-destructive">{incorrectCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">incorrect</div>
            </div>
            <div className="rounded-md bg-muted/50 p-2">
              <div className="text-xl font-semibold text-muted-foreground">
                {correctCount + incorrectCount}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">total keystrokes</div>
            </div>
          </div>

          {/* Keyboard heatmap */}
          {Object.keys(keyCounts).length > 0 && (
            <div>
              <SectionLabel>Key heatmap</SectionLabel>
              <KeyboardHeatmap keyCounts={keyCounts} />
            </div>
          )}

          {/* Performance graph */}
          {hasTimeline && (
            <div>
              <SectionLabel>Performance over time</SectionLabel>
              <ChartContainer config={chartConfig} className="h-[180px] w-full">
                <ComposedChart data={timeline} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="second" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    label={{ value: "s", position: "insideRight", offset: 4, fontSize: 11 }} />
                  <YAxis yAxisId="cpm" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
                  <YAxis yAxisId="errors" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
                  <ChartTooltip
                    content={<ChartTooltipContent labelFormatter={(v) => `${v}s`} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area yAxisId="cpm" type="monotone" dataKey="cpm"
                    stroke="var(--color-cpm)" fill="var(--color-cpm)" fillOpacity={0.15}
                    strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Area yAxisId="cpm" type="monotone" dataKey="rawCpm"
                    stroke="var(--color-rawCpm)" fill="var(--color-rawCpm)" fillOpacity={0.08}
                    strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 4 }} />
                  <Bar yAxisId="errors" dataKey="errors"
                    fill="var(--color-errors)" radius={[2, 2, 0, 0]} maxBarSize={12} />
                </ComposedChart>
              </ChartContainer>
            </div>
          )}

          {/* Previous sessions comparison */}
          {prevSessions.length > 0 && (
            <div>
              <SectionLabel>Previous sessions</SectionLabel>
              <div className="space-y-1.5">
                {prevSessions.map((s) => (
                  <PrevRow key={s.id} session={s} currentCpm={result.cpm} currentAccuracy={result.accuracy} />
                ))}
              </div>
            </div>
          )}

          {/* Repo info */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">{result.mode}</Badge>
              <Badge variant="outline" className="font-mono text-xs max-w-[240px] truncate">
                {result.repo}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate px-4">
              {result.filePath}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onRestart} className="flex-1">Try again</Button>
            <Button onClick={onHome} variant="outline" className="flex-1">Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
      {children}
    </p>
  )
}

function PrevRow({
  session,
  currentCpm,
  currentAccuracy,
}: {
  session: StoredResult
  currentCpm: number
  currentAccuracy: number
}) {
  const deltaCpm = currentCpm - session.cpm
  const deltaAcc = currentAccuracy - session.accuracy
  const date = new Date(session.timestamp)
  const timeStr = date.toLocaleString(undefined, {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

  return (
    <div className="flex items-center gap-3 text-xs font-mono bg-muted/40 rounded-md px-3 py-2 text-muted-foreground">
      <span className="w-28 shrink-0 truncate">{timeStr}</span>
      <span className="w-16 shrink-0">{session.cpm} cpm</span>
      <Delta value={deltaCpm} unit="cpm" />
      <span className="w-10 shrink-0">{session.accuracy}%</span>
      <Delta value={deltaAcc} unit="%" />
      <span className="truncate flex-1 text-right opacity-60">{session.repo}</span>
    </div>
  )
}

function Delta({ value, unit }: { value: number; unit: string }) {
  if (value === 0) return <span className="w-16 shrink-0 text-muted-foreground">—</span>
  const positive = value > 0
  return (
    <span className={`w-16 shrink-0 ${positive ? "text-green-500" : "text-destructive"}`}>
      {positive ? "+" : ""}{value}{unit}
    </span>
  )
}
