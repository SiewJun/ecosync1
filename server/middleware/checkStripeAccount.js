const { CompanyDetail } = require('../models');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const checkStripeAccount = async (req, res, next) => {
  try {
    const companyDetail = await CompanyDetail.findOne({ where: { userId: req.user.id } });

    if (!companyDetail || !companyDetail.stripeAccountId) {
      return res.status(403).json({ message: 'Please complete Stripe onboarding first.', redirectUrl: '/company-dashboard/stripe-onboarding' });
    }

    if (!companyDetail.stripeOnboardingComplete) {
      const account = await stripe.accounts.retrieve(companyDetail.stripeAccountId);
      if (!account.details_submitted || !account.payouts_enabled) {
        return res.status(403).json({ message: 'Please complete Stripe onboarding first.', redirectUrl: '/company-dashboard/stripe-onboarding' });
      }
      
      // Update onboarding status if it's complete
      await CompanyDetail.update({ stripeOnboardingComplete: true }, { where: { userId: req.user.id } });
    }

    next();
  } catch (error) {
    console.error('Error checking Stripe account:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = checkStripeAccount;