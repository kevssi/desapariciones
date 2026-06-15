import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Loader2 } from 'lucide-react';
import { BreadcrumbProvider } from './context/BreadcrumbContext';
import { Navbar } from './components/Navbar';
import { Breadcrumb } from './components/Breadcrumb';
import { HomePage } from './pages/Home';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CreatePostPage } from './pages/CreatePost';
import { EditPostPage } from './pages/EditPost';
import { PersonDetailPage } from './pages/PersonDetail';
import { ProfilePage } from './pages/Profile';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#2b7d9e' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#666' }}>Verificando sesión...</p>
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Breadcrumb />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/persona/:id" element={<PersonDetailPage />} />
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreatePostPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/editar/:id"
          element={
            <PrivateRoute>
              <EditPostPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <BreadcrumbProvider>
          <AppContent />
        </BreadcrumbProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
