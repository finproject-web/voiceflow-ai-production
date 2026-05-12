"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  max?: number
  min?: number
  step?: number
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [0], onValueChange, max = 100, min = 0, step = 1, disabled, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value)
    
    React.useEffect(() => {
      setInternalValue(value)
    }, [value])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = [Number(e.target.value)]
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center w-full h-2 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={internalValue[0]}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="relative w-full h-full bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{
              width: `${((internalValue[0] - min) / (max - min)) * 100}%`
            }}
          />
        </div>
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }
