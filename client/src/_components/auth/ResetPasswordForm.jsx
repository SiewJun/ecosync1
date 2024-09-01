import { useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import axios from 'axios';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPassword(value);
    setPasswordStarted(true);
    setPasswordConditions({
      length: value.length >= 6,
      upperCase: /[A-Z]/.test(value),
      lowerCase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    });
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!passwordConditions.length || !passwordConditions.upperCase || !passwordConditions.lowerCase || !passwordConditions.number || !passwordConditions.specialChar) {
      setError("Password must be at least 6 characters long and include upper and lower case letters, a number, and a special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { token, password });
      setMessage('Password has been reset successfully');
    } catch (error) {
      setError(error.response.data.message || 'An error occurred');
    }
  };

  return (
    <div className="flex w-full flex-col items-center min-h-screen justify-center">
      <div className="w-[350px] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">Enter your new password below.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Your new password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordStarted && (
              <div className="text-sm text-gray-600 mt-2">
                <p>Password must be at least 6 characters long.</p>
                <ul className="list-disc list-inside text-gray-600">
                  <li className={passwordConditions.length ? "text-green-500" : "text-red-500"}>
                    At least 6 characters long
                  </li>
                  <li className={passwordConditions.upperCase ? "text-green-500" : "text-red-500"}>
                    Includes an uppercase letter
                  </li>
                  <li className={passwordConditions.lowerCase ? "text-green-500" : "text-red-500"}>
                    Includes a lowercase letter
                  </li>
                  <li className={passwordConditions.number ? "text-green-500" : "text-red-500"}>
                    Includes a number
                  </li>
                  <li className={passwordConditions.specialChar ? "text-green-500" : "text-red-500"}>
                    Includes a special character
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className="pr-12"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center space-x-2 border border-red-500 bg-red-100 text-red-700 p-2 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{message}</p>
            </div>
          )}
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
