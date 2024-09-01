import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThemeProvider from './context/ThemeContext';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/signin" />} />
        </Routes>
      </Router>
    </div>
  );
};

const AppWrapper = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWrapper;