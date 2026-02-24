import { useState, useEffect, useCallback, useRef } from 'react'

export function useTimer(initialSeconds = 180, enabled = true) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(enabled)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning, seconds])

  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(enabled)
  }, [initialSeconds, enabled])

  const stop = useCallback(() => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
  }, [])

  const formatTime = (s) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    seconds,
    isRunning,
    isExpired: seconds <= 0,
    formatted: formatTime(seconds),
    reset,
    stop,
  }
}
