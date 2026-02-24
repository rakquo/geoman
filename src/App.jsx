import { Routes, Route } from 'react-router-dom'
import { QuizProvider } from './context/QuizContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ContinentPage from './pages/ContinentPage'
import QuizPage from './pages/QuizPage'

export default function App() {
  return (
    <QuizProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/continent/:continentId" element={<ContinentPage />} />
          <Route path="/continent/:continentId/:category" element={<QuizPage />} />
        </Routes>
      </Layout>
    </QuizProvider>
  )
}
