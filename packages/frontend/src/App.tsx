import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { TRPCProvider } from './utils/trpc-provider';
import { Header } from './components/Header';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import PublicPage from './components/PublicPage';
import AdminDashboard from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AuthCallback } from './components/AuthCallback';

function App() {
  return (
    <TRPCProvider>
      <AuthProvider>
        <ToastProvider>
          <Header />
          <Routes>
            <Route path="/" element={<PublicPage />} />
            <Route path="/user/:urlId" element={<PublicPage />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </TRPCProvider>
  );
}

export default App;
