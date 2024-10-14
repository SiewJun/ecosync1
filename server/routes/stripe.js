const express = require("express");
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require("../middleware/auth");
const { CompanyDetail } = require('../models');

router.post('/create-stripe-account', authenticateToken, async (req, res) => {
  const { email } = req.body;

  try {
    const existingCompany = await CompanyDetail.findOne({ where: { userId: req.user.id } });
    if (existingCompany && existingCompany.stripeAccountId) {
      return res.status(400).json({ message: 'Stripe account already exists for this company.' });
    }

    const account = await stripe.accounts.create({
      type: 'standard',
      country: 'MY',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await CompanyDetail.upsert({
      userId: req.user.id,
      stripeAccountId: account.id,
      stripeOnboardingComplete: false
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/company-dashboard/stripe-onboarding`,
      return_url: `${process.env.FRONTEND_URL}/company-dashboard`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    res.status(500).json({ message: 'Failed to create Stripe account.', error: error.message });
  }
});

router.get('/check-onboarding-status', authenticateToken, async (req, res) => {
  try {
    const companyDetail = await CompanyDetail.findOne({ where: { userId: req.user.id } });
    
    if (!companyDetail || !companyDetail.stripeAccountId) {
      return res.status(404).json({ message: 'No Stripe account found for this company.' });
    }

    const account = await stripe.accounts.retrieve(companyDetail.stripeAccountId);
    const isOnboardingComplete = account.details_submitted && account.payouts_enabled;

    if (isOnboardingComplete && !companyDetail.stripeOnboardingComplete) {
      await CompanyDetail.update({ stripeOnboardingComplete: true }, { where: { userId: req.user.id } });
    }

    res.json({ isOnboardingComplete });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    res.status(500).json({ message: 'Failed to check onboarding status.', error: error.message });
  }
});

module.exports = router;