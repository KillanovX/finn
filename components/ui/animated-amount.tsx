"use client"

import React, { useEffect, useState, useRef } from "react"

interface AnimatedAmountProps {
  value: string
  isVisible: boolean
  className?: string
}

export function AnimatedAmount({ value, isVisible, className = "" }: AnimatedAmountProps) {
  const getTargetChars = (visible: boolean, valStr: string) => {
    const chars = valStr.split("")
    return visible
      ? chars
      : chars.map((ch) => (/[0-9.,]/.test(ch) ? "*" : ch))
  }

  const [currentChars, setCurrentChars] = useState<string[]>(() =>
    getTargetChars(isVisible, value)
  )

  const isFirstRender = useRef(true)

  useEffect(() => {
    const targetChars = getTargetChars(isVisible, value)

    if (isFirstRender.current || currentChars.length !== targetChars.length) {
      isFirstRender.current = false
      setCurrentChars(targetChars)
      return
    }

    const indicesToChange: number[] = []
    for (let i = 0; i < targetChars.length; i++) {
      if (currentChars[i] !== targetChars[i]) {
        indicesToChange.push(i)
      }
    }

    if (indicesToChange.length === 0) return

    const duration = 220
    const interval = Math.max(16, Math.floor(duration / indicesToChange.length))

    let step = 0
    const timer = setInterval(() => {
      if (step < indicesToChange.length) {
        const idxToUpdate = indicesToChange[step]
        setCurrentChars((prev) => {
          if (prev.length !== targetChars.length) return targetChars
          const next = [...prev]
          next[idxToUpdate] = targetChars[idxToUpdate]
          return next
        })
        step++
      } else {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {currentChars.map((ch, idx) => {
        const isAsterisk = ch === "*"
        return (
          <span
            key={idx}
            className={`inline-block transition-all duration-200 ease-out select-none ${
              isAsterisk
                ? "font-sans font-semibold opacity-75 scale-90"
                : "opacity-100 scale-100"
            }`}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        )
      })}
    </span>
  )
}
