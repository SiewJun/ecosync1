import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader } from "lucide-react";

const CompleteRegistration = () => {
  const { token } = useParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCompleteRegistration = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/complete-registration", {
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
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6 mt-16 mb-16 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Complete Registration</CardTitle>
          <CardDescription className="mt-2">
            Click the button below to complete your registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 mt-4">
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
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleCompleteRegistration}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Completing Registration...</span>
              </div>
            ) : (
              "Complete Registration"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompleteRegistration;