import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader } from "lucide-react";

const AuthDialog = ({ isOpen, onClose, onLogin, error, activeTab, setActiveTab }) => {
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Authentication Required</DialogTitle>
          <DialogDescription className="text-gray-500">Please log in or register to request a quotation.</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSubmit={onLogin} error={error} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm resendCooldown={resendCooldown} setResendCooldown={setResendCooldown} setActiveTab={setActiveTab} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const LoginForm = ({ onSubmit, error }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-500">Email</label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-500">Password</label>
        <input
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full transition-colors duration-300">Login</Button>
    </form>
  );
};

const RegisterForm = ({ resendCooldown, setResendCooldown, setActiveTab }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    upperCase: false,
    lowerCase: false,
    number: false,
    specialChar: false,
  });
  const [passwordStarted, setPasswordStarted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [token, setToken] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (id === "password") {
      setPasswordStarted(true);
      setPasswordConditions({
        length: value.length >= 6,
        upperCase: /[A-Z]/.test(value),
        lowerCase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!formData.username) {
      setError("Username is required");
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Invalid email format");
      setIsSubmitting(false);
      return;
    }

    if (
      !passwordConditions.length ||
      !passwordConditions.upperCase ||
      !passwordConditions.lowerCase ||
      !passwordConditions.number ||
      !passwordConditions.specialChar
    ) {
      setError(
        "Password must be at least 6 characters long and include upper and lower case letters, a number, and a special character."
      );
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
      } else {
        const data = await response.json();
        setSuccess("OTP sent to your email. Please check your email to complete the registration.");
        setEmailSent(true);
        setToken(data.token);
        setResendCooldown(60); // Set cooldown period to 60 seconds
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
      } else {
        const data = await response.json();
        setSuccess("OTP resent to your email. Please check your email to complete the registration.");
        setToken(data.token);
        setResendCooldown(60); // Reset cooldown period to 60 seconds
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
      } else {
        setSuccess("Registration completed successfully! You can now log in.");
        setTimeout(() => {
          setActiveTab("login");
        }, 3000);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={emailSent ? handleVerifyOtp : handleSubmit} className="space-y-4">
      {!emailSent && (
        <>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-500">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-500">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-500">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Choose a password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          {passwordStarted && (
            <div className="text-sm text-gray-600 mt-2">
              <p>Password must be at least 6 characters long.</p>
              <ul className="list-disc list-inside text-gray-600">
                <li className={passwordConditions.length ? "text-green-500" : "text-red-500"}>At least 6 characters long</li>
                <li className={passwordConditions.upperCase ? "text-green-500" : "text-red-500"}>Includes an uppercase letter</li>
                <li className={passwordConditions.lowerCase ? "text-green-500" : "text-red-500"}>Includes a lowercase letter</li>
                <li className={passwordConditions.number ? "text-green-500" : "text-red-500"}>Includes a number</li>
                <li className={passwordConditions.specialChar ? "text-green-500" : "text-red-500"}>Includes a special character</li>
              </ul>
            </div>
          )}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-500">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
        </>
      )}
      {emailSent && (
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-500">OTP</label>
            <input
              type="text"
              id="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            />
          </div>
          <div className="text-center text-sm mt-4">
            <p>
              Didn&apos;t receive the email?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
              >
                Resend OTP {resendCooldown > 0 && `(${resendCooldown}s)`}
              </Button>
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 border border-red-500 bg-red-100 text-red-700 p-2 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{success}</p>
        </div>
      )}
      <Button type="submit" className="w-full transition-colors duration-300" disabled={isSubmitting}>
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader className="w-5 h-5 animate-spin" />
            <span>{emailSent ? "Verifying OTP..." : "Registering..."}</span>
          </div>
        ) : (
          emailSent ? "Verify OTP" : "Register"
        )}
      </Button>
    </form>
  );
};

AuthDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.string,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
};

RegisterForm.propTypes = {
  resendCooldown: PropTypes.number.isRequired,
  setResendCooldown: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default AuthDialog;