import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Loader } from "lucide-react";

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStarted, setPasswordStarted] = useState(false);

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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  const handleVerifyOtp = async () => {
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
        setSuccess("Registration completed successfully! Redirecting to login page...");
        setTimeout(() => {
          navigate("/signin");
        }, 3000);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background/95 p-4">
      <Card className="w-full max-w-md relative backdrop-blur-sm shadow-xl border-opacity-50">
        <CardHeader className="space-y-4">
          <CardTitle className="text-4xl font-bold tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-base">
            Join our community and start your solar journey today.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Company Registration Link */}
          <CardDescription className="text-center pb-4 border-b">
            Registering as a company?{" "}
            <Link 
              to="/company-signup" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Create a business account
            </Link>
          </CardDescription>

          {/* Main Form Section */}
          <div className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className="h-11 transition-all"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11 transition-all"
                required
              />
            </div>

            {/* Password Field Group */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Create password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 pr-12 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {passwordStarted && (
                  <div className="mt-3 p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-2">Password requirements:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <RequirementIndicator
                        met={passwordConditions.length}
                        text="6+ characters"
                      />
                      <RequirementIndicator
                        met={passwordConditions.upperCase}
                        text="Uppercase letter"
                      />
                      <RequirementIndicator
                        met={passwordConditions.lowerCase}
                        text="Lowercase letter"
                      />
                      <RequirementIndicator
                        met={passwordConditions.number}
                        text="Number"
                      />
                      <RequirementIndicator
                        met={passwordConditions.specialChar}
                        text="Special character"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {formData.password && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="h-11 pr-12 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* OTP Section */}
            {emailSent && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    Enter verification code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-11 text-center text-lg tracking-widest"
                    maxLength={6}
                    required
                  />
                </div>
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-sm h-auto p-0"
                  >
                    {resendCooldown > 0 
                      ? `Resend code in ${resendCooldown}s` 
                      : "Resend verification code"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {(error || success) && (
            <div className={`rounded-lg p-4 ${
              error 
                ? "bg-destructive/10 text-destructive"
                : "bg-green-500/10 text-green-500"
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error || success}</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full h-11 text-base font-medium transition-all"
            onClick={emailSent ? handleVerifyOtp : handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>{emailSent ? "Verifying..." : "Creating account..."}</span>
              </div>
            ) : (
              emailSent ? "Complete signup" : "Continue"
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link 
              to="/signin"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

// Helper component for password requirements
import PropTypes from 'prop-types';

const RequirementIndicator = ({ met, text }) => (
  <div className="flex items-center gap-2">
    <div className={`h-1.5 w-1.5 rounded-full transition-colors ${
      met ? "bg-green-500" : "bg-muted-foreground/30"
    }`} />
    <span className={`text-xs ${
      met ? "text-green-500" : "text-muted-foreground"
    }`}>
      {text}
    </span>
  </div>
);

RequirementIndicator.propTypes = {
  met: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
};

export default SignUpForm;

