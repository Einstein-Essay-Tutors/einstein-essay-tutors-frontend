'use client'

import { useEffect, useRef, useState } from 'react'

interface UseAnimatedCounterOptions {
  duration?: number
  delay?: number
  decimals?: number
}

export function useAnimatedCounter(
  endValue: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { duration = 2000, delay = 0, decimals = 0 } = options
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const frameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (hasAnimated || endValue === 0) {
      setCount(endValue)
      return
    }

    const startAnimation = () => {
      setHasAnimated(true)
      startTimeRef.current = Date.now()

      const animate = () => {
        const now = Date.now()
        const elapsed = now - (startTimeRef.current || now)
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentCount = endValue * easeOutQuart

        setCount(currentCount)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate)
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    const timeoutId = setTimeout(startAnimation, delay)

    return () => {
      clearTimeout(timeoutId)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [endValue, duration, delay, hasAnimated])

  const formattedValue = decimals > 0 
    ? count.toFixed(decimals)
    : Math.floor(count).toString()

  return formattedValue
}