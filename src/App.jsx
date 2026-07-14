import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Scene from './pages/Scene'
import Pixels from './pages/Pixels'
import HDPixels from './pages/HDPixels'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scene" element={<Scene />} />
            <Route path="/pixels" element={<Pixels />} />
            <Route path="/hd" element={<HDPixels />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
