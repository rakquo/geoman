function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1])
    }
  }
  return matrix[a.length][b.length]
}

function normalize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
}

export function checkAnswer(userInput, acceptedAnswers) {
  const normalized = normalize(userInput)
  if (!normalized) return false
  return acceptedAnswers.some((answer) => {
    const normalizedAnswer = normalize(answer)
    if (normalized === normalizedAnswer) return true
    if (normalizedAnswer.length > 4 && levenshtein(normalized, normalizedAnswer) <= 2) return true
    if (normalizedAnswer.length > 8 && normalizedAnswer.startsWith(normalized) && normalized.length >= 5) return true
    return false
  })
}

export function calculateScore(answers, quizData) {
  let correct = 0
  let incorrect = 0
  let skipped = 0
  const results = quizData.map((item) => {
    const userAnswer = answers[item.id] || ''
    if (!userAnswer.trim()) {
      skipped++
      return { ...item, userAnswer: '', isCorrect: false, isSkipped: true }
    }
    const isCorrect = checkAnswer(userAnswer, item.acceptedAnswers)
    if (isCorrect) correct++
    else incorrect++
    return { ...item, userAnswer, isCorrect, isSkipped: false }
  })
  return { correct, incorrect, skipped, total: quizData.length, results }
}
