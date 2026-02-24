import { useState, useCallback } from 'react'
import { calculateScore } from '../utils/scoring'

export function useQuiz(quizData) {
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('active') // 'active' | 'submitted'
  const [results, setResults] = useState(null)
  const [focusedId, setFocusedId] = useState(null)

  const updateAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const submit = useCallback(() => {
    if (!quizData) return
    const scoreResults = calculateScore(answers, quizData)
    setResults(scoreResults)
    setPhase('submitted')
  }, [answers, quizData])

  const retry = useCallback(() => {
    setAnswers({})
    setResults(null)
    setPhase('active')
    setFocusedId(null)
  }, [])

  const hasAnyAnswer = Object.values(answers).some((v) => v.trim() !== '')

  return {
    answers,
    phase,
    results,
    focusedId,
    setFocusedId,
    updateAnswer,
    submit,
    retry,
    hasAnyAnswer,
  }
}
