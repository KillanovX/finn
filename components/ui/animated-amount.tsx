"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"

interface AnimatedAmountProps {
  value: string
  isVisible: boolean
  className?: string
}

/**
 * A single character cell that performs a split-flap / mechanical clock animation.
 *
 * Key design decisions:
 * - Uses a fixed `width: 1ch` for every character slot (digit, separator, asterisk)
 *   so that the total width of the string never changes during animation → zero layout shift.
 * - The animation is CSS-only (`@keyframes`) with direction chosen based on
 *   whether we are hiding (top→bottom) or revealing (bottom→top).
 * - A staggered `setTimeout` per character index produces the sequential wave.
 */
function FlipCell({
  char: targetChar,
  index,
  direction,
  isMasked,
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

    // Only animate numeric characters (digits + separators + asterisk)
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

  // Pick animation direction
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
      className="relative inline-flex items-center justify-center overflow-hidden select-none text-center"
      style={{
        width: "0.62em",
        height: "1.25em",
        verticalAlign: "baseline",
      }}
    >
      {isFlipping ? (
        <React.Fragment key={flipKey}>
          {/* Outgoing */}
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
          {/* Incoming */}
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
        <span className="flex items-center justify-center w-full h-full">
          {renderChar(displayChar)}
        </span>
      )}
    </span>
  )
}

/* ──────────────────────────────────────── */

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
  const maskedChars = chars.map((ch) => (/[0-9]/.test(ch) ? "*" : ch))

  const displayChars = isVisible ? chars : maskedChars

  return (
    <span
      className={`inline-flex items-baseline ${className}`}
      style={{ lineHeight: 1 }}
    >
      <style>{`
        @keyframes flipOutDown {
          from {
            transform: translateY(0) rotateX(0);
            opacity: 1;
          }
          to {
            transform: translateY(60%) rotateX(70deg);
            opacity: 0;
          }
        }
        @keyframes flipInDown {
          from {
            transform: translateY(-60%) rotateX(-70deg);
            opacity: 0;
          }
          to {
            transform: translateY(0) rotateX(0);
            opacity: 1;
          }
        }
        @keyframes flipOutUp {
          from {
            transform: translateY(0) rotateX(0);
            opacity: 1;
          }
          to {
            transform: translateY(-60%) rotateX(-70deg);
            opacity: 0;
          }
        }
        @keyframes flipInUp {
          from {
            transform: translateY(60%) rotateX(70deg);
            opacity: 0;
          }
          to {
            transform: translateY(0) rotateX(0);
            opacity: 1;
          }
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
