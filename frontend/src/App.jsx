/**
 * App.jsx - Updated with Analytics Dashboard (Tasks 241-250)
 */
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import GuestRoute from './components/GuestRoute';
import Login from './pages/Login';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import ThemeTestPage from './pages/ThemeTest';
import AuthTestPage from './pages/AuthTest';
import TokenTestPage from './pages/TokenTest';
import ApiTestPage from './pages/ApiTest';

const HomePage = () => {
  const { loginAsGuest } = useAuth();

  useEffect(() => {
    document.title = 'YouTube Analytics - Home';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold text-gradient mb-4">
          YouTube Analytics Dashboard
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Desktop-optimized analytics platform for YouTube data
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={loginAsGuest} className="btn-primary">
            Get Started as Guest
          </button>
          <a href="/search" className="btn-secondary">
            Explore Search
          </a>
        </div>
      </div>
    </div>
  );
};

// Component to handle dynamic page titles
const PageTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    const titles = {
      '/': 'YouTube Analytics - Home',
      '/login': 'YouTube Analytics - Login',
      '/search': 'YouTube Analytics - Search',
      '/analytics': 'YouTube Analytics - Dashboard',
      '/theme': 'YouTube Analytics - Theme Test',
      '/auth-test': 'YouTube Analytics - Auth Test',
      '/token-test': 'YouTube Analytics - Token Test',
      '/api-test': 'YouTube Analytics - API Test',
    };
    
    document.title = titles[location.pathname] || 'YouTube Analytics';
  }, [location]);
  
  return null;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="animate-spin text-6xl">⏳</div>
      </div>
    );
  }

  return (
    <>
      <PageTitle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/search" element={<GuestRoute><Search /></GuestRoute>} />
          <Route path="/analytics" element={<GuestRoute><Analytics /></GuestRoute>} />
          <Route path="/theme" element={<GuestRoute><ThemeTestPage /></GuestRoute>} />
          <Route path="/auth-test" element={<GuestRoute><AuthTestPage /></GuestRoute>} />
          <Route path="/token-test" element={<GuestRoute><TokenTestPage /></GuestRoute>} />
          <Route path="/api-test" element={<GuestRoute><ApiTestPage /></GuestRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;