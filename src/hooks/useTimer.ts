import { useEffect, useRef, useState } from "react"
import type { Duration, TestMode } from "@/types"

export function useTimer(
  mode: TestMode,
  duration: Duration,
  started: boolean,
  finished: boolean,
  onExpire: () => void,
  onTick?: (elapsed: number) => void,
): { remaining: number; elapsed: number } {
  const [remaining, setRemaining] = useState(duration)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpireRef = useRef(onExpire)
  const onTickRef = useRef(onTick)

  onExpireRef.current = onExpire
  onTickRef.current = onTick

  useEffect(() => {
    if (!started || finished) return

    let tick = 0
    intervalRef.current = setInterval(() => {
      tick++
      setElapsed(tick)
      onTickRef.current?.(tick)

      if (mode === "timed") {
        setRemaining((r) => {
          const next = r - 1
          if (next <= 0) {
            clearInterval(intervalRef.current!)
            onExpireRef.current()
            return 0
          }
          return next
        })
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [started, finished, mode])

  useEffect(() => {
    setRemaining(duration)
    setElapsed(0)
  }, [duration])

  return { remaining, elapsed }
}
