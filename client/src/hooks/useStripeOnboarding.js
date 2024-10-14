import { useState, useEffect } from 'react';
import axios from 'axios';

const useStripeOnboarding = () => {
  const [isOnboarded, setIsOnboarded] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stripe/check-onboarding-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setIsOnboarded(response.data.isOnboardingComplete);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboarded(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  return { isOnboarded, isLoading };
};

export default useStripeOnboarding;