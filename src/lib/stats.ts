import type { StoredResult } from "@/types"

const STORAGE_KEY = "typecode-results"
const MAX_STORED = 200

export function saveTestResult(result: StoredResult): void {
  const existing = getStoredResults()
  existing.push(result)
  if (existing.length > MAX_STORED) existing.splice(0, existing.length - MAX_STORED)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function getStoredResults(): StoredResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredResult[]
  } catch {
    return []
  }
}
