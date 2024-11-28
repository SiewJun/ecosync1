import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowRightCircle } from 'lucide-react';

const StripeOnboardingPrompt = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 p-0">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Complete Your Stripe Setup
            </h2>
            <p className="text-foreground/80 text-sm">
              Unlock full access to quotation features
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6 bg-foreground">
          <div className="bg-background rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Why Stripe Onboarding?</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Stripe onboarding helps us verify your account, ensuring secure and smooth financial transactions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              className="w-full py-3 font-semibold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
              variant="outline"
              asChild
            >
              <Link to="/company-dashboard/stripe-onboarding" className="flex items-center justify-center">
                Complete Onboarding
                <ArrowRightCircle className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-center text-xs text-background">
              Completing onboarding takes less than 5 minutes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeOnboardingPrompt;