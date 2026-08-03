"use client"

import React, { useEffect, useState, useRef } from "react"

interface AnimatedAmountProps {
  value: string
  isVisible: boolean
  className?: string
}

export function AnimatedAmount({ value, isVisible, className = "" }: AnimatedAmountProps) {
  const visibleChars = value.split("")
  const hiddenChars = visibleChars.map((ch) => (/[0-9.,]/.test(ch) ? "*" : ch))
  const total = visibleChars.length

  const [stepIndex, setStepIndex] = useState<number>(total)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      setStepIndex(total)
      return
    }

    const intervalMs = Math.max(18, Math.min(40, Math.floor(300 / Math.max(total, 1))))
    let current = 0
    setStepIndex(0)

    const timer = setInterval(() => {
      current += 1
      setStepIndex(current)
      if (current >= total) {
        clearInterval(timer)
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isVisible, value, total])

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {visibleChars.map((vChar, idx) => {
        const hChar = hiddenChars[idx]
        const isRevealed = isVisible ? idx < stepIndex : idx >= stepIndex
        const displayChar = isRevealed ? vChar : hChar
        const isAsterisk = displayChar === "*"

        return (
          <span
            key={idx}
            className={`inline-block transition-all duration-150 ease-out select-none ${
              isAsterisk
                ? "font-sans font-semibold opacity-85 text-current transform scale-105"
                : "opacity-100 transform scale-100"
            }`}
          >
            {displayChar === " " ? "\u00A0" : displayChar}
          </span>
        )
      })}
    </span>
  )
}
