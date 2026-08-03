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
  const isSeparator = /[.,]/.test(vChar)
  const targetChar = isVisible ? vChar : hChar

  const [currentChar, setCurrentChar] = useState(targetChar)
  const [prevChar, setPrevChar] = useState<string | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const activeCharRef = useRef(targetChar)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      activeCharRef.current = targetChar
      setCurrentChar(targetChar)
      return
    }

    if (!isNumber) {
      activeCharRef.current = targetChar
      setCurrentChar(targetChar)
      setPrevChar(null)
      setIsFlipping(false)
      return
    }

    if (targetChar === activeCharRef.current) return

    const prev = activeCharRef.current
    activeCharRef.current = targetChar

    const delay = index * 20

    const timer = setTimeout(() => {
      setPrevChar(prev)
      setCurrentChar(targetChar)
      setIsFlipping(true)
      setAnimKey((k) => k + 1)

      const endTimer = setTimeout(() => {
        setIsFlipping(false)
        setPrevChar(null)
      }, 150)

      return () => clearTimeout(endTimer)
    }, delay)

    return () => clearTimeout(timer)
  }, [isVisible, targetChar, index, isNumber])

  const renderCharContent = (ch: string) => {
    if (ch === " ") return "\u00A0"
    if (ch === "*") {
      return (
        <span className="inline-block transform translate-y-[0.1em] font-sans font-bold opacity-80">
          *
        </span>
      )
    }
    return ch
  }

  if (!isNumber) {
    return (
      <span className="relative inline-flex items-center justify-center h-[1.3em] align-middle select-none px-[1px]">
        {renderCharContent(currentChar)}
      </span>
    )
  }

  const widthClass = isSeparator ? "min-w-[0.3em] px-[0.5px]" : "min-w-[0.62em] px-[0.5px]"

  return (
    <span
      key={animKey}
      className={`relative inline-flex items-center justify-center overflow-hidden h-[1.3em] ${widthClass} align-middle select-none`}
      style={{ perspective: "300px" }}
    >
      {isFlipping && prevChar && prevChar !== currentChar ? (
        <>
          {/* Outgoing card */}
          <span
            className="absolute inset-0 flex items-center justify-center leading-none"
            style={{
              animation: "mechRotateOut 140ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
              transformOrigin: "50% 50%",
              backfaceVisibility: "hidden",
            }}
          >
            {renderCharContent(prevChar)}
          </span>

          {/* Incoming card */}
          <span
            className="absolute inset-0 flex items-center justify-center leading-none"
            style={{
              animation: "mechRotateIn 140ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
              transformOrigin: "50% 50%",
              backfaceVisibility: "hidden",
            }}
          >
            {renderCharContent(currentChar)}
          </span>
        </>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center leading-none">
          {renderCharContent(currentChar)}
        </span>
      )}
    </span>
  )
}

export function AnimatedAmount({ value, isVisible, className = "" }: AnimatedAmountProps) {
  const visibleChars = value.split("")
  const hiddenChars = visibleChars.map((ch) => (/[0-9.,]/.test(ch) ? "*" : ch))

  return (
    <span className={`inline-flex items-center align-middle leading-none ${className}`}>
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
