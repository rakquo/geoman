import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { QuizProvider } from './context/QuizContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'

export default function App() {
  return (
    <ThemeProvider>
      <QuizProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/continent/:continentId" element={<QuizPage />} />
          </Routes>
        </Layout>
      </QuizProvider>
    </ThemeProvider>
  )
}
