import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThemeProvider from './context/ThemeContext';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
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