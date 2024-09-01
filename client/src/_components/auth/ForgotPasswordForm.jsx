import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from 'axios';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage('If an account with that email exists, a password reset link has been sent.');
    } catch (error) {
      setError(error.response.data.message || 'An error occurred');
    }
  };

  return (
    <div className="flex w-full flex-col items-center min-h-screen justify-center">
      <div className="w-[350px] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a password reset link.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ecosync@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="flex items-center space-x-2 border border-red-500 bg-red-100 text-red-700 p-2 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-center space-x-2 border border-green-500 bg-green-100 text-green-700 p-2 rounded-md">
              <p className="text-sm">{message}</p>
            </div>
          )}
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
