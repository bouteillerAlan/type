import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FONT_SIZES, type FontSize } from "@/lib/settings"

interface Props {
  value: FontSize
  onChange: (size: FontSize) => void
}

export function FontSizePicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {FONT_SIZES.map((size) => (
        <Button
          key={size}
          size="sm"
          variant={value === size ? "default" : "ghost"}
          onClick={() => onChange(size)}
          className={cn("font-mono w-12")}
        >
          {size}
        </Button>
      ))}
    </div>
  )
}
