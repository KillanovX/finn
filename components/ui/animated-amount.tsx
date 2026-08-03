"use client"

import React, { useEffect, useState, useRef } from "react"

interface AnimatedAmountProps {
  value: string
  isVisible: boolean
  className?: string
}

function MechanicalChar({
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
  const isNumber = /[0-9.,]/.test(vChar)
  const targetChar = isVisible ? vChar : hChar

  const [currentChar, setCurrentChar] = useState(targetChar)
  const [prevChar, setPrevChar] = useState<string | null>(null)
  const [animKey, setAnimKey] = useState(0)

  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    if (!isNumber) {
      setCurrentChar(targetChar)
      setPrevChar(null)
      return
    }

    // Stagger delay per character index (35ms per step)
    const delay = index * 35

    const timer = setTimeout(() => {
      setPrevChar((old) => {
        const source = old ?? currentChar
        if (source === targetChar) return null
        return source
      })
      setCurrentChar(targetChar)
      setAnimKey((k) => k + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [isVisible, targetChar, index, isNumber])

  const isAsterisk = currentChar === "*"

  if (!isNumber || prevChar === null || prevChar === currentChar) {
    return (
      <span
        className={`inline-block select-none ${
          isAsterisk ? "font-sans font-semibold opacity-80" : ""
        }`}
      >
        {currentChar === " " ? "\u00A0" : currentChar}
      </span>
    )
  }

  const prevIsAsterisk = prevChar === "*"

  return (
    <span
      key={animKey}
      className="relative inline-block overflow-hidden h-[1.2em] min-w-[0.55em] align-baseline select-none"
      style={{ perspective: "300px" }}
    >
      {/* Outgoing card: rotates down out from center to bottom */}
      <span
        className={`absolute inset-0 flex items-center justify-center ${
          prevIsAsterisk ? "font-sans font-semibold opacity-80" : ""
        }`}
        style={{
          animation: "mechRotateOut 230ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          transformOrigin: "50% 50%",
          backfaceVisibility: "hidden",
        }}
      >
        {prevChar === " " ? "\u00A0" : prevChar}
      </span>

      {/* Incoming card: rotates down in from top to center */}
      <span
        className={`absolute inset-0 flex items-center justify-center ${
          isAsterisk ? "font-sans font-semibold opacity-80" : ""
        }`}
        style={{
          animation: "mechRotateIn 230ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          transformOrigin: "50% 50%",
          backfaceVisibility: "hidden",
        }}
      >
        {currentChar === " " ? "\u00A0" : currentChar}
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
        @keyframes mechRotateIn {
          0% {
            transform: perspective(250px) rotateX(-90deg) translateY(-70%);
            opacity: 0;
          }
          100% {
            transform: perspective(250px) rotateX(0deg) translateY(0%);
            opacity: 1;
          }
        }
        @keyframes mechRotateOut {
          0% {
            transform: perspective(250px) rotateX(0deg) translateY(0%);
            opacity: 1;
          }
          100% {
            transform: perspective(250px) rotateX(90deg) translateY(70%);
            opacity: 0;
          }
        }
      `}</style>
      {visibleChars.map((vChar, idx) => (
        <MechanicalChar
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
