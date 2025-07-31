import {Routes, Route} from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";
import LoginForm from "./components/LoginForm";
import HomePage from "./components/HomePage";
import {AuthCallback} from "./components/AuthCallback";
import {ProtectedRoute} from "./components/ProtectedRoute";
import {ToastProvider} from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
