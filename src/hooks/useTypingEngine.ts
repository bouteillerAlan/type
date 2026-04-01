import { useReducer } from "react"
import type { TokenizedChar, TestResult, TestMode } from "@/types"

interface TypingState {
  chars: TokenizedChar[]
  cursor: number
  correctCount: number
  totalTyped: number
  started: boolean
  finished: boolean
  startTime: number | null
  keyHistory: string[]
  keyCounts: Record<string, number>
}

type Action =
  | { type: "KEYPRESS"; key: string }
  | { type: "BACKSPACE" }
  | { type: "FINISH" }
  | { type: "RESET"; chars: TokenizedChar[] }

function keyLabel(key: string): string {
  if (key === "\n") return "↵"
  if (key === " ") return "⎵"
  if (key === "\t") return "⇥"
  return key
}

function isWhitespaceChar(c: string): boolean {
  return c === " " || c === "\t"
}

function reducer(state: TypingState, action: Action): TypingState {
  switch (action.type) {
    case "KEYPRESS": {
      if (state.finished) return state
      const { cursor, chars } = state
      if (cursor >= chars.length) return state

      const expected = chars[cursor].char
      const isCorrect =
        action.key === expected ||
        (isWhitespaceChar(action.key) && isWhitespaceChar(expected))

      const label = keyLabel(action.key)
      const newHistory = [...state.keyHistory, label].slice(-4)
      const newKeyCounts = {
        ...state.keyCounts,
        [label]: (state.keyCounts[label] ?? 0) + 1,
      }

      const newChars = [...chars]
      newChars[cursor] = {
        ...newChars[cursor],
        state: isCorrect ? "correct" : "incorrect",
      }

      const newCursor = cursor + 1
      const finished = newCursor >= chars.length

      return {
        ...state,
        chars: newChars,
        cursor: newCursor,
        correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
        totalTyped: state.totalTyped + 1,
        started: true,
        startTime: state.startTime ?? Date.now(),
        finished,
        keyHistory: newHistory,
        keyCounts: newKeyCounts,
      }
    }

    case "BACKSPACE": {
      if (state.finished || state.cursor === 0) return state

      const newCursor = state.cursor - 1
      const newChars = [...state.chars]
      const wasCorrect = newChars[newCursor].state === "correct"
      newChars[newCursor] = { ...newChars[newCursor], state: "pending" }

      const bsLabel = "⌫"
      return {
        ...state,
        chars: newChars,
        cursor: newCursor,
        correctCount: wasCorrect ? state.correctCount - 1 : state.correctCount,
        totalTyped: state.totalTyped > 0 ? state.totalTyped - 1 : 0,
        keyHistory: [...state.keyHistory, bsLabel].slice(-4),
        keyCounts: {
          ...state.keyCounts,
          [bsLabel]: (state.keyCounts[bsLabel] ?? 0) + 1,
        },
      }
    }

    case "FINISH":
      return { ...state, finished: true }

    case "RESET":
      return {
        chars: action.chars,
        cursor: 0,
        correctCount: 0,
        totalTyped: 0,
        started: false,
        finished: false,
        startTime: null,
        keyHistory: [],
        keyCounts: {},
      }

    default:
      return state
  }
}

function computeCpm(correctCount: number, startTime: number | null): number {
  if (!startTime || correctCount === 0) return 0
  const elapsed = (Date.now() - startTime) / 60_000
  if (elapsed <= 0) return 0
  return Math.round(correctCount / elapsed)
}

function computeAccuracy(correctCount: number, totalTyped: number): number {
  if (totalTyped === 0) return 100
  return Math.round((correctCount / totalTyped) * 100)
}

export function useTypingEngine(initialChars: TokenizedChar[]) {
  const [state, dispatch] = useReducer(reducer, {
    chars: initialChars,
    cursor: 0,
    correctCount: 0,
    totalTyped: 0,
    started: false,
    finished: false,
    startTime: null,
    keyHistory: [],
    keyCounts: {},
  })

  const cpm = computeCpm(state.correctCount, state.startTime)
  const rawCpm = computeCpm(state.totalTyped, state.startTime)
  const accuracy = computeAccuracy(state.correctCount, state.totalTyped)

  function buildResult(
    mode: TestMode,
    repo: string,
    filePath: string,
    elapsedSeconds: number,
  ): TestResult {
    return {
      cpm: computeCpm(state.correctCount, state.startTime),
      rawCpm: computeCpm(state.totalTyped, state.startTime),
      accuracy: computeAccuracy(state.correctCount, state.totalTyped),
      duration: elapsedSeconds,
      mode,
      repo,
      filePath,
    }
  }

  return {
    chars: state.chars,
    cursor: state.cursor,
    cpm,
    rawCpm,
    accuracy,
    correctCount: state.correctCount,
    totalTyped: state.totalTyped,
    started: state.started,
    finished: state.finished,
    startTime: state.startTime,
    keyHistory: state.keyHistory,
    keyCounts: state.keyCounts,
    dispatch,
    buildResult,
  }
}
