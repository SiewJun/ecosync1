import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StripeOnboarding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleOnboardCompany = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/stripe/create-stripe-account', 
        { email },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create Stripe account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Your Stripe Account</h2>
      <p className="mb-4">In order to receive payments, you need to create a Stripe account.</p>
      {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}
      <form onSubmit={handleOnboardCompany}>
        <Input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={loading}
          required
          className="mb-4"
        />
        <Button type="submit" disabled={loading || !email}>
          {loading ? 'Processing...' : 'Create Stripe Account'}
        </Button>
      </form>
    </div>
  );
};

export default StripeOnboarding;