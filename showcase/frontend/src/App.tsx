import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStores } from './stores/RootStore';
import LoginPage from './pages/LoginPage';
import CodeVerificationPage from './pages/CodeVerificationPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
  const { authStore } = useStores();
  return authStore.isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
});

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-code" element={<CodeVerificationPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;
