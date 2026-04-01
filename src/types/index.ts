export type TestMode = "timed" | "snippet"
export type Duration = 15 | 30 | 60 | 120
export type CharState = "pending" | "correct" | "incorrect"

export interface TokenizedChar {
  char: string
  color: string
  state: CharState
}

export interface SnippetData {
  chars: TokenizedChar[]
  language: string
  repo: string
  filePath: string
}

export interface TestSearchParams {
  repo: string
  mode: TestMode
  duration: Duration
}

export interface TestResult {
  cpm: number
  rawCpm: number
  accuracy: number
  duration: number
  mode: TestMode
  repo: string
  filePath: string
}

export interface TimePoint {
  second: number
  cpm: number
  rawCpm: number
  correct: number
  errors: number
}

export interface StoredResult {
  id: string
  timestamp: number
  cpm: number
  rawCpm?: number
  accuracy: number
  mode: TestMode
  duration: number
  repo: string
  correct: number
  incorrect: number
  keyCounts?: Record<string, number>
}
