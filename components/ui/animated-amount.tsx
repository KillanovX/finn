"use client"

import React, { useEffect, useState, useRef } from "react"

interface AnimatedAmountProps {
  value: string
  isVisible: boolean
  className?: string
}

function FlipChar({
  vChar,
  hChar,
  isVisible,
  index,
}: {
  vChar: string
  hChar: string
  isVisible: boolean
  index: number
}) {
  const isNumberChar = /[0-9.,]/.test(vChar)
  const targetChar = isVisible ? vChar : hChar

  const [displayState, setDisplayState] = useState<{
    current: string
    prev: string | null
    flipping: boolean
  }>({
    current: targetChar,
    prev: null,
    flipping: false,
  })

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      setDisplayState({ current: targetChar, prev: null, flipping: false })
      return
    }

    if (!isNumberChar) {
      setDisplayState({ current: targetChar, prev: null, flipping: false })
      return
    }

    const delay = index * 32

    const timer = setTimeout(() => {
      setDisplayState((prev) => {
        if (prev.current === targetChar) return prev
        return {
          current: targetChar,
          prev: prev.current,
          flipping: true,
        }
      })

      const resetTimer = setTimeout(() => {
        setDisplayState((prev) => ({
          ...prev,
          prev: null,
          flipping: false,
        }))
      }, 210)

      return () => clearTimeout(resetTimer)
    }, delay)

    return () => clearTimeout(timer)
  }, [isVisible, targetChar, index, isNumberChar])

  const { current, prev, flipping } = displayState
  const isAsterisk = current === "*"

  if (!isNumberChar || !flipping || !prev || prev === current) {
    return (
      <span
        className={`inline-block select-none ${
          isAsterisk ? "font-sans font-semibold opacity-80" : ""
        }`}
      >
        {current === " " ? "\u00A0" : current}
      </span>
    )
  }

  return (
    <span className="relative inline-block overflow-hidden h-[1.2em] align-baseline select-none">
      <span
        className={`absolute inset-0 flex items-center justify-center ${
          prev === "*" ? "font-sans font-semibold opacity-80" : ""
        }`}
        style={{
          animation: "flipOutToBottom 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        }}
      >
        {prev === " " ? "\u00A0" : prev}
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center ${
          isAsterisk ? "font-sans font-semibold opacity-80" : ""
        }`}
        style={{
          animation: "flipInFromTop 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        }}
      >
        {current === " " ? "\u00A0" : current}
      </span>
    </span>
  )
}

export function AnimatedAmount({ value, isVisible, className = "" }: AnimatedAmountProps) {
  const visibleChars = value.split("")
  const hiddenChars = visibleChars.map((ch) => (/[0-9.,]/.test(ch) ? "*" : ch))

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <style>{`
        @keyframes flipInFromTop {
          0% {
            transform: translateY(-100%) rotateX(-50deg);
            opacity: 0;
          }
          100% {
            transform: translateY(0%) rotateX(0deg);
            opacity: 1;
          }
        }
        @keyframes flipOutToBottom {
          0% {
            transform: translateY(0%) rotateX(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100%) rotateX(50deg);
            opacity: 0;
          }
        }
      `}</style>
      {visibleChars.map((vChar, idx) => (
        <FlipChar
          key={idx}
          vChar={vChar}
          hChar={hiddenChars[idx]}
          isVisible={isVisible}
          index={idx}
        />
      ))}
    </span>
  )
}
