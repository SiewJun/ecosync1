import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, AlertCircle, Loader } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

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
      await axios.post(
        "http://localhost:5000/api/auth/complete-registration-company",
        { password, token },
        { withCredentials: true } // Include credentials in the request
      );
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
    <div className="flex items-center justify-center min-h-screen bg-background/95 p-4">
      <div className="w-full max-w-md p-6 shadow-xl rounded-lg border border-opacity-50 backdrop-blur-sm">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Complete Registration</h2>
        <p className="text-base text-muted-foreground mb-8">
          Please enter a password to finalize your company account application.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Create password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
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

              {/* Updated Password Requirements Section */}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
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

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Completing registration...</span>
              </div>
            ) : (
              "Complete registration"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

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

export default CompletedCompanySignUp;