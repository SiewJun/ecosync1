import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, Globe, Zap, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StripeOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleOnboardCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/stripe/create-stripe-account",
        {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Failed to create Stripe account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      text: "Fast setup",
      tooltip: "Get started in under 5 minutes",
    },
    {
      icon: Shield,
      text: "Secure payments",
      tooltip: "Bank-level security standards",
    },
    {
      icon: Globe,
      text: "Global reach",
      tooltip: "Accept payments from 135+ countries",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-8 shadow-xl bg-foreground backdrop-blur-sm border-foreground">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-medium text-background">
              Connect with Stripe
            </h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-background" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-64">
                    Connect your business with Stripe to start accepting
                    payments securely worldwide
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-background/80">
            Set up secure payments in minutes
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleOnboardCompany} className="space-y-6">
          <div className="relative">
            <Input
              type="email"
              placeholder="Business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="h-12 text-foreground"
            />
            {email && !email.includes("@") && (
              <p className="text-yellow-500 text-xs mt-1">
                Please enter a valid email address
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !email || !email.includes("@")}
            className="w-full h-12 relative group bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 hover:opacity-90 transition-all duration-300 hover:scale-[1.02]"
          >
            <span
              className={
                loading
                  ? "opacity-0"
                  : "opacity-100 flex items-center justify-center"
              }
            >
              Continue to Stripe
              <ArrowRight className="ml-2 w-4 h-4 inline group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                Processing...
              </div>
            )}
          </Button>

          <p className="text-xs text-center text-background/90">
            By continuing, you agree to Stripe&apos;s{" "}
            <a
              href="#"
              className="underline hover:text-gray-400 transition-colors"
            >
              Terms of Service
            </a>
          </p>
        </form>

        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800">
          <TooltipProvider>
            {features.map(({ icon: Icon, text, tooltip }, index) => (
              <Tooltip key={index}>
                <TooltipTrigger>
                  <div className="text-center space-y-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors">
                    <Icon className="w-5 h-5 mx-auto text-background/90" />
                    <div className="text-sm text-background/90">{text}</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
};

export default StripeOnboarding;
