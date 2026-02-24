import { createContext, useContext, useReducer } from 'react'

const QuizContext = createContext(null)

const initialState = {
  scores: {},  // { 'asia-cities': { correct: 7, total: 10 }, ... }
  totalCorrect: 0,
  totalAttempted: 0,
}

function quizReducer(state, action) {
  switch (action.type) {
    case 'RECORD_SCORE': {
      const { continentId, category, correct, total } = action.payload
      const key = `${continentId}-${category}`
      const prev = state.scores[key]
      const newScores = {
        ...state.scores,
        [key]: { correct, total, date: Date.now() },
      }
      return {
        ...state,
        scores: newScores,
        totalCorrect: state.totalCorrect - (prev?.correct || 0) + correct,
        totalAttempted: state.totalAttempted - (prev?.total || 0) + total,
      }
    }
    default:
      return state
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState)
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuizContext() {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuizContext must be used within QuizProvider')
  return ctx
}
