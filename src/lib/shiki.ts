import { createHighlighter, type Highlighter } from "shiki"
import type { TokenizedChar } from "@/types"

let _highlighter: Highlighter | null = null

async function getHighlighter(): Promise<Highlighter> {
  if (_highlighter) return _highlighter
  _highlighter = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: [
      "c",
      "cpp",
      "javascript",
      "typescript",
      "tsx",
      "python",
      "go",
      "shellscript",
      "rust",
      "java",
    ],
  })
  return _highlighter
}

export async function tokenizeCode(
  code: string,
  lang: string,
  colorScheme: "dark" | "light" = "dark",
): Promise<TokenizedChar[]> {
  const hl = await getHighlighter()

  const supportedLangs = hl.getLoadedLanguages()
  const safeLang = supportedLangs.includes(lang as never) ? lang : "javascript"
  const theme = colorScheme === "light" ? "github-light" : "github-dark"

  const { tokens } = hl.codeToTokens(code, { lang: safeLang as Parameters<typeof hl.codeToTokens>[1]["lang"], theme })

  const chars: TokenizedChar[] = []
  for (let lineIdx = 0; lineIdx < tokens.length; lineIdx++) {
    const line = tokens[lineIdx]
    for (const token of line) {
      for (const char of token.content) {
        chars.push({ char, color: token.color ?? "#abb2bf", state: "pending" })
      }
    }
    if (lineIdx < tokens.length - 1) {
      chars.push({ char: "\n", color: "#abb2bf", state: "pending" })
    }
  }

  return chars
}
