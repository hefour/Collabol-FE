import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import ProfilePage from './pages/ProfilePage'
import ReviewPage from './pages/ReviewPage'
import SharePage from './pages/SharePage'

export default function App() {
  return (
    <Routes>
      {/* 인증 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 공개 */}
      <Route path="/profile/:userId/share" element={<SharePage />} />

      {/* 앱 (사이드바 레이아웃) */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}