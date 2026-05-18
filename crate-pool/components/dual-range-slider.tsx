"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "./ui/label"
import { useEffect, useState } from "react"

interface SliderRangeProps {
  min: number
  max: number
  step: number
  value: [number, number]
  text: string
  className?: string
  onChange: (value: [number, number]) => void
}

export function SliderRange({
  min,
  max,
  step,
  value,
  text,
  className,
  onChange,
}: SliderRangeProps) {
  const [localState, setLocalState] = useState<[number, number]>(value);

  // Synka lokal state när URL-värdet ändras externt (reset, navigation)
  useEffect(() => {
    setLocalState(value);
  }, [value[0], value[1]]);

  return (
    <div className={`grid w-full gap-3 md:max-w-xs ${className ?? ""}`}>
      <div className="flex justify-between">
        <Label>{text}</Label>
        <span className="text-sm text-muted-foreground">
          {localState[0]} - {localState[1]}
        </span>
      </div>

      <Slider
        value={localState}
        onValueChange={(v) => setLocalState(v as [number, number])}
        onValueCommitted={(v) => onChange(v as [number, number])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  )
}