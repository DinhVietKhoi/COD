import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AntdProvider from './components/AntdProvider';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import QuizHomePage from './pages/QuizHomePage';
import QuizKindPage from './pages/QuizKindPage';
import QuizPlayPage from './pages/QuizPlayPage';
import SchedulePage from './pages/SchedulePage';

export default function App() {
  return (
    <AntdProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizHomePage />} />
            <Route path="/quiz/:kind" element={<QuizKindPage />} />
            <Route path="/quiz/:kind/play" element={<QuizPlayPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AntdProvider>
  );
}
