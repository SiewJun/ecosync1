import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Loader } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CompletedCompanySignUp = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStarted, setPasswordStarted] = useState(false);
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
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "password") {
      setPassword(value);
      setPasswordStarted(true);
      setPasswordConditions({
        length: value.length >= 6,
        upperCase: /[A-Z]/.test(value),
        lowerCase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    } else if (id === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/complete-registration", {
        password,
        token,
      });
      setSuccess("Registration completed successfully");
      setError("");
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (error) {
      setError(error.response.data.message || "An error occurred");
      setSuccess("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md mx-auto p-6 shadow-md rounded-md">
        <h2 className="text-2xl font-semibold mb-4">Complete Registration</h2>
        <p className="text-lg font-medium mb-10">
          Please enter a password to finalize your company account application.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
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
          <div className="grid gap-2 relative">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
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
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Completing Registration...</span>
              </div>
            ) : (
              "Complete Registration"
            )}
          </Button>
          {error && (
            <div className="flex items-center space-x-2 border border-red-500 bg-red-100 text-red-700 p-2 rounded-md mt-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md mt-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{success}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CompletedCompanySignUp;
