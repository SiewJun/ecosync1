import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import HomePage from './pages/HomePage';
import ThemeProvider from './context/ThemeContext';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CompanyRegistrationPage from './pages/auth/CompanySignUpPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CompletedCompanySignUpPage from './pages/auth/CompletedCompanySignUpPage';

const App = () => {
  const token = localStorage.getItem('token');
  let userRole = null;
  let isAuthenticated = false;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.role;
      isAuthenticated = true;
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token'); // remove invalid token
    }
  }

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/company-signup" element={<CompanyRegistrationPage />} />
          <Route path="/admindashboard" element={userRole === 'ADMIN' ? <AdminDashboardPage /> : <Navigate to="/signin" />} />
          <Route path="/complete-registration" element={<CompletedCompanySignUpPage />} />
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
