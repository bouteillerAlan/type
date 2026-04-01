import { cn } from "@/lib/utils"
import type { TokenizedChar } from "@/types"

interface Props {
  char: TokenizedChar
  isCursor: boolean
  cursorRef?: React.RefObject<HTMLSpanElement | null>
}

export function CharSpan({ char, isCursor, cursorRef }: Props) {
  const isNewline = char.char === "\n"

  return (
    <span
      ref={cursorRef}
      style={{
        color: char.state !== "incorrect" ? char.color : undefined,
      }}
      className={cn(
        "relative opacity-[0.55]",
        char.state === "correct" && "opacity-100",
        char.state === "incorrect" &&
          "bg-destructive/20 text-destructive opacity-100",
        isCursor &&
          "after:absolute after:left-0 after:top-0 after:h-full after:w-0.5 after:bg-primary after:animate-pulse",
      )}
    >
      {isNewline ? (
        <>
          <span className="opacity-20 select-none text-xs">↵</span>
          <br />
        </>
      ) : (
        char.char
      )}
    </span>
  )
}
