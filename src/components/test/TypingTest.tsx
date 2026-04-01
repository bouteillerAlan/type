import { useCallback, useEffect, useRef, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTypingEngine } from "@/hooks/useTypingEngine"
import { useTimer } from "@/hooks/useTimer"
import { CodeDisplay } from "./CodeDisplay"
import { HiddenInput } from "./HiddenInput"
import { StatsBar } from "./StatsBar"
import { ResultsCard } from "./ResultsCard"
import { saveTestResult, getStoredResults } from "@/lib/stats"
import type { StoredResult } from "@/types"
import { loadSettings, saveSettings, FONT_SIZES, type FontSize } from "@/lib/settings"
import type { SnippetData, Duration, TestMode, TimePoint } from "@/types"

interface Props {
  snippet: SnippetData
  mode: TestMode
  duration: Duration
  onRestart: () => void
}

export function TypingTest({ snippet, mode, duration, onRestart }: Props) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const [fontSize, setFontSize] = useState<FontSize>(() => loadSettings().fontSize)

  function handleFontSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const size = Number(e.target.value) as FontSize
    setFontSize(size)
    saveSettings({ ...loadSettings(), fontSize: size })
  }

  const {
    chars,
    cursor,
    cpm,
    rawCpm,
    accuracy,
    correctCount,
    totalTyped,
    started,
    finished,
    keyHistory,
    keyCounts,
    dispatch,
    buildResult,
  } = useTypingEngine(snippet.chars)

  const cpmRef = useRef(cpm)
  cpmRef.current = cpm
  const rawCpmRef = useRef(rawCpm)
  rawCpmRef.current = rawCpm
  const correctCountRef = useRef(correctCount)
  correctCountRef.current = correctCount
  const totalTypedRef = useRef(totalTyped)
  totalTypedRef.current = totalTyped
  const keyCountsRef = useRef(keyCounts)
  keyCountsRef.current = keyCounts

  const timelineRef = useRef<TimePoint[]>([])
  const prevCorrectRef = useRef(0)
  const prevErrorsRef = useRef(0)
  const [prevSessions, setPrevSessions] = useState<StoredResult[]>([])

  const SESSION_PHRASES = useMemo(() => [
    "stay in the zone",
    "lock in",
    "don't blink",
    "smooth and steady",
    "keep the flow",
    "eyes on the code",
    "you got this",
    "no mistakes, only xp",
    "breathe",
    "full send",
  ], [])
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [showGo, setShowGo] = useState(false)

  useEffect(() => {
    if (!started || finished) return
    setShowGo(true)
    const hideTimer = setTimeout(() => setShowGo(false), 1500)
    return () => clearTimeout(hideTimer)
  }, [started])

  useEffect(() => {
    if (!started || finished) return
    const interval = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % SESSION_PHRASES.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [started, finished, SESSION_PHRASES])

  const { remaining, elapsed } = useTimer(
    mode,
    duration,
    started,
    finished,
    () => dispatch({ type: "FINISH" }),
    (elapsedSec) => {
      const correct = correctCountRef.current
      const errors = totalTypedRef.current - correctCountRef.current
      timelineRef.current.push({
        second: elapsedSec,
        cpm: cpmRef.current,
        rawCpm: rawCpmRef.current,
        correct: correct - prevCorrectRef.current,
        errors: Math.max(0, errors - prevErrorsRef.current),
      })
      prevCorrectRef.current = correct
      prevErrorsRef.current = errors
    },
  )

  useEffect(() => {
    if (!finished) return
    const correct = correctCountRef.current
    const total = totalTypedRef.current
    // Snapshot last 2 sessions before saving current
    setPrevSessions(getStoredResults().slice(-2).reverse())
    saveTestResult({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      cpm: cpmRef.current,
      rawCpm: rawCpmRef.current,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 100,
      mode,
      duration: mode === "timed" ? duration - remaining : elapsed,
      repo: snippet.repo,
      correct,
      incorrect: total - correct,
      keyCounts: keyCountsRef.current,
    })
  }, [finished])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === "Backspace") { e.preventDefault(); dispatch({ type: "BACKSPACE" }); return }
      if (e.key === "Enter") { e.preventDefault(); dispatch({ type: "KEYPRESS", key: "\n" }); return }
    },
    [dispatch],
  )

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      const native = e.nativeEvent as InputEvent
      if (native.isComposing) return
      const data = native.data
      e.currentTarget.value = ""
      if (data && data.length === 1) dispatch({ type: "KEYPRESS", key: data })
    },
    [dispatch],
  )

  useEffect(() => { inputRef.current?.focus() }, [])

  const focusInput = useCallback(() => { inputRef.current?.focus() }, [])

  const result = finished
    ? buildResult(
        mode,
        snippet.repo,
        snippet.filePath,
        mode === "timed" ? duration - remaining : elapsed,
      )
    : null

  return (
    <div className="relative w-full" onClick={focusInput}>
      {/* Header: file path + font size select + action buttons */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-muted-foreground font-mono truncate">
          <span className="text-primary/60">{snippet.repo}</span>
          <span className="mx-1 opacity-40">/</span>
          <span>{snippet.filePath}</span>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!finished && (
            <>
              {mode === "snippet" && started && (
                <button
                  onClick={() => dispatch({ type: "FINISH" })}
                  className="px-3 py-1 text-xs font-medium rounded border border-destructive/60 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  End
                </button>
              )}
              <button
                onClick={onRestart}
                className="px-3 py-1 text-xs font-medium rounded border border-yellow-500/60 text-yellow-500 hover:bg-yellow-500/10 transition-colors"
              >
                Reload
              </button>
            </>
          )}
          <select
            value={fontSize}
            onChange={handleFontSizeChange}
            className="text-xs bg-background border border-border rounded px-1.5 py-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}px
              </option>
            ))}
          </select>
        </div>
      </div>

      <StatsBar
        cpm={cpm}
        rawCpm={rawCpm}
        accuracy={accuracy}
        remaining={remaining}
        elapsed={elapsed}
        mode={mode}
        duration={duration}
        started={started}
        keyHistory={keyHistory}
        keyCounts={keyCounts}
      />

      <div className="relative cursor-text">
        <CodeDisplay chars={chars} cursor={cursor} fontSize={fontSize} />
        <HiddenInput inputRef={inputRef} onKeyDown={handleKeyDown} onInput={handleInput} />
      </div>

      <p className="mt-2 text-xs text-muted-foreground text-center h-4 transition-all">
        {!started && !finished
          ? "— press any key to begin —"
          : started && !finished
          ? showGo
            ? "— GO! —"
            : `— ${SESSION_PHRASES[phraseIdx]} —`
          : null}
      </p>

      {result && (
        <ResultsCard
          result={result}
          timeline={timelineRef.current}
          correctCount={correctCountRef.current}
          incorrectCount={totalTypedRef.current - correctCountRef.current}
          keyCounts={keyCountsRef.current}
          prevSessions={prevSessions}
          onRestart={onRestart}
          onHome={() => navigate("/")}
        />
      )}
    </div>
  )
}
