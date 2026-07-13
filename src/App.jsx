import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { QuizProvider } from './context/QuizContext'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import Home from './pages/Home'
import QuizSetup from './pages/QuizSetup'
import QuizTake from './pages/QuizTake'
import QuizResults from './pages/QuizResults'
import QuizHistory from './pages/QuizHistory'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <QuizProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="pt-14">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/setup" element={<QuizSetup />} />
                <Route path="/quiz" element={<QuizTake />} />
                <Route path="/results" element={<QuizResults />} />
                <Route path="/results/:id" element={<QuizResults />} />
                <Route path="/history" element={<QuizHistory />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
            <Toast />
          </div>
        </ToastProvider>
      </QuizProvider>
    </ThemeProvider>
  )
}

export default App
