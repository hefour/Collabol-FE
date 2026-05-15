import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProfilePage from "./pages/ProfilePage";
import ReviewPage from "./pages/ReviewPage";
import SharePage from "./pages/SharePage";
import EvaluatePage from "./pages/EvaluatePage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile/:userId/share" element={<SharePage />} />

      <Route element={<Layout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/review/:project" element={<ReviewPage />} />
        <Route path="/evaluate/:project" element={<EvaluatePage />} />
        <Route path="/projects/:project" element={<ProjectDetailPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
