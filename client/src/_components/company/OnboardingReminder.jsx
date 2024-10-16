import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const OnboardingReminder = () => (
  <Alert className="mb-4">
    <AlertTitle>Complete Your Stripe Onboarding</AlertTitle>
    <AlertDescription>
      To fully access all features and accept payments, please complete your Stripe account setup. 
      <Link to="/company-dashboard/stripe-onboarding" className="ml-2 text-primary font-medium underline hover:text-foreground">
        Complete Setup
      </Link>
    </AlertDescription>
  </Alert>
);

export default OnboardingReminder;