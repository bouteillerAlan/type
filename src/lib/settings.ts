import type { Duration, TestMode } from "@/types"

const KEY = "typecode-settings"

export const FONT_SIZES = [14, 16, 20, 24, 28, 32] as const
export type FontSize = (typeof FONT_SIZES)[number]

export interface AppSettings {
  repo: string | null
  mode: TestMode
  duration: Duration
  fontSize: FontSize
  autoIndent: boolean
}

const DEFAULTS: AppSettings = {
  repo: null,
  mode: "timed",
  duration: 60,
  fontSize: 24,
  autoIndent: true,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      repo: typeof parsed.repo === "string" ? parsed.repo : DEFAULTS.repo,
      mode: parsed.mode === "snippet" ? "snippet" : "timed",
      duration: ([15, 30, 60, 120] as Duration[]).includes(parsed.duration as Duration)
        ? (parsed.duration as Duration)
        : DEFAULTS.duration,
      fontSize: FONT_SIZES.includes(parsed.fontSize as FontSize)
        ? (parsed.fontSize as FontSize)
        : DEFAULTS.fontSize,
      autoIndent: typeof parsed.autoIndent === "boolean" ? parsed.autoIndent : DEFAULTS.autoIndent,
    }
  } catch {
    return DEFAULTS
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // Fail silently
  }
}
