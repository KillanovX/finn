"use client"

import React, { useEffect, useState, useRef } from "react"

interface AnimatedAmountProps {
  value: string
  isVisible: boolean
  className?: string
}

function FlipCell({
  char: targetChar,
  index,
  direction,
}: {
  char: string
  index: number
  direction: "hide" | "reveal" | null
  isMasked: boolean
}) {
  const [displayChar, setDisplayChar] = useState(targetChar)
  const [flipFrom, setFlipFrom] = useState<string | null>(null)
  const [flipKey, setFlipKey] = useState(0)
  const activeRef = useRef(targetChar)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      activeRef.current = targetChar
      setDisplayChar(targetChar)
      return
    }

    if (targetChar === activeRef.current) return
    const prev = activeRef.current
    activeRef.current = targetChar

    const isAnimatable = /[0-9.,*]/.test(targetChar) || /[0-9.,*]/.test(prev)
    if (!isAnimatable) {
      setDisplayChar(targetChar)
      setFlipFrom(null)
      return
    }

    const delay = index * 25
    const timer = setTimeout(() => {
      setFlipFrom(prev)
      setDisplayChar(targetChar)
      setFlipKey((k) => k + 1)

      const cleanup = setTimeout(() => setFlipFrom(null), 180)
      return () => clearTimeout(cleanup)
    }, delay)

    return () => clearTimeout(timer)
  }, [targetChar, index])

  const isFlipping = flipFrom !== null && flipFrom !== displayChar

  const outAnim = direction === "reveal"
    ? "flipOutUp 160ms cubic-bezier(.4,0,.15,1) forwards"
    : "flipOutDown 160ms cubic-bezier(.4,0,.15,1) forwards"
  const inAnim = direction === "reveal"
    ? "flipInUp 160ms cubic-bezier(.4,0,.15,1) forwards"
    : "flipInDown 160ms cubic-bezier(.4,0,.15,1) forwards"

  const renderChar = (ch: string) => {
    if (ch === " ") return "\u00A0"
    return ch
  }

  return (
    <span
      className="relative inline-block overflow-hidden select-none text-center"
      style={{
        width: "0.62em",
        height: "1em",
        lineHeight: "1em",
      }}
    >
      {/* Invisible spacer always in flow to lock height */}
      <span className="invisible" aria-hidden="true">0</span>

      {isFlipping ? (
        <React.Fragment key={flipKey}>
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: outAnim,
              backfaceVisibility: "hidden",
              willChange: "transform, opacity",
            }}
          >
            {renderChar(flipFrom!)}
          </span>
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: inAnim,
              backfaceVisibility: "hidden",
              willChange: "transform, opacity",
            }}
          >
            {renderChar(displayChar)}
          </span>
        </React.Fragment>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          {renderChar(displayChar)}
        </span>
      )}
    </span>
  )
}

export function AnimatedAmount({ value, isVisible, className = "" }: AnimatedAmountProps) {
  const prevVisibleRef = useRef(isVisible)
  const [direction, setDirection] = useState<"hide" | "reveal" | null>(null)

  useEffect(() => {
    if (isVisible !== prevVisibleRef.current) {
      setDirection(isVisible ? "reveal" : "hide")
      prevVisibleRef.current = isVisible
    }
  }, [isVisible])

  const chars = value.split("")
  // Mask digits AND separators (. ,) with * when hidden
  const maskedChars = chars.map((ch) => (/[0-9.,]/.test(ch) ? "*" : ch))
  const displayChars = isVisible ? chars : maskedChars

  return (
    <span
      className={`inline-flex items-baseline ${className}`}
      style={{ lineHeight: 1 }}
    >
      <style>{`
        @keyframes flipOutDown {
          from { transform: translateY(0) rotateX(0); opacity: 1; }
          to   { transform: translateY(55%) rotateX(60deg); opacity: 0; }
        }
        @keyframes flipInDown {
          from { transform: translateY(-55%) rotateX(-60deg); opacity: 0; }
          to   { transform: translateY(0) rotateX(0); opacity: 1; }
        }
        @keyframes flipOutUp {
          from { transform: translateY(0) rotateX(0); opacity: 1; }
          to   { transform: translateY(-55%) rotateX(-60deg); opacity: 0; }
        }
        @keyframes flipInUp {
          from { transform: translateY(55%) rotateX(60deg); opacity: 0; }
          to   { transform: translateY(0) rotateX(0); opacity: 1; }
        }
      `}</style>
      {displayChars.map((ch, idx) => (
        <FlipCell
          key={idx}
          char={ch}
          index={idx}
          direction={direction}
          isMasked={!isVisible}
        />
      ))}
    </span>
  )
}
