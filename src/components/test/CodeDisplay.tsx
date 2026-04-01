import { useEffect, useRef } from "react"
import { CharSpan } from "./CharSpan"
import type { FontSize } from "@/lib/settings"
import type { TokenizedChar } from "@/types"

interface Props {
  chars: TokenizedChar[]
  cursor: number
  fontSize: FontSize
}

function getLookaheadIdx(chars: TokenizedChar[], cursor: number, lineCount = 2): number {
  let i = cursor
  let linesFound = 0
  while (i < chars.length && linesFound < lineCount) {
    if (chars[i].char === "\n") linesFound++
    i++
  }
  return Math.min(i, chars.length - 1)
}

export function CodeDisplay({ chars, cursor, fontSize }: Props) {
  const lookaheadRef = useRef<HTMLSpanElement | null>(null)
  const lookaheadIdx = getLookaheadIdx(chars, cursor, 4)

  useEffect(() => {
    lookaheadRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [cursor])

  return (
    <pre
      style={{ fontSize }}
      className={[
        "roboto-mono leading-relaxed",
        "whitespace-pre overflow-x-auto",
        "max-h-[60vh] overflow-y-auto",
        "rounded-lg border border-border",
        "bg-[#f6f8fa] dark:bg-[#0d1117]",
        "p-5 select-none w-full",
      ].join(" ")}
    >
      {chars.map((c, i) => (
        <CharSpan
          key={i}
          char={c}
          isCursor={i === cursor}
          cursorRef={i === lookaheadIdx ? lookaheadRef : undefined}
        />
      ))}
    </pre>
  )
}
