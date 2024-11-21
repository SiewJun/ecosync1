import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:5000/api/auth/register", {
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
        setSuccess("Registration successful! Redirecting to login page...");
        navigate("/signin"); // Redirect immediately after success
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6 mt-16 mb-16 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Register</CardTitle>
          <CardDescription className="mt-2">
            Enter your details below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-4">
          <CardDescription className="text-center text-gray-600">
            If you are registering for a company, please{" "}
            <Link to="/company-signup" className="underline text-blue-600">
              click here
            </Link>
            .
          </CardDescription>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
            {passwordStarted && (
              <div className="text-sm text-gray-600 mt-2">
                <p>Password must be at least 6 characters long.</p>
                <ul className="list-disc list-inside text-gray-600">
                  <li
                    className={
                      passwordConditions.length
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    At least 6 characters long
                  </li>
                  <li
                    className={
                      passwordConditions.upperCase
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Includes an uppercase letter
                  </li>
                  <li
                    className={
                      passwordConditions.lowerCase
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Includes a lowercase letter
                  </li>
                  <li
                    className={
                      passwordConditions.number
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Includes a number
                  </li>
                  <li
                    className={
                      passwordConditions.specialChar
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    Includes a special character
                  </li>
                </ul>
              </div>
            )}
          </div>
          {formData.password && (
            <div className="grid gap-2 relative">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-600" />
                  )}
                </button>
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
          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/signin" className="underline">
              <Button variant="link" className="p-0">
                Sign in
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing Up...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpForm;