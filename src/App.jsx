import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Projekte from './pages/Projekte'
import ProjectDetail from './pages/ProjectDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 1400, margin: '0 auto', background: '#fff' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projekte" element={<Projekte />} />
          <Route path="/projekte/:id" element={<ProjectDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
