interface Props {
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onInput: (e: React.FormEvent<HTMLTextAreaElement>) => void
}

export function HiddenInput({ inputRef, onKeyDown, onInput }: Props) {
  return (
    <textarea
      ref={inputRef}
      onKeyDown={onKeyDown}
      onInput={onInput}
      className="fixed top-0 left-0 -translate-x-full opacity-0 w-px h-px resize-none"
      autoCapitalize="none"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      aria-hidden="true"
    />
  )
}
