const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const authenticateToken = require("../middleware/auth");
const { User, CompanyDetail, Project, ProjectStep } = require("../models");

// Webhook handler
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Received event:", event.type);

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      console.log("Checkout session completed:", session.id);
      console.log("Session metadata:", session.metadata);
      await handleCheckoutSessionCompleted(session);
      break;
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent succeeded:", paymentIntent.id);
      console.log("PaymentIntent metadata:", paymentIntent.metadata);
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    case "payment_intent.requires_action":
    case "payment_intent.created":
    case "transfer.created":
    case "payment.created":
    case "charge.succeeded":
      console.log(`Received ${event.type} event:`, event.data.object);
      // Add any necessary handling for these events
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

async function handleCheckoutSessionCompleted(session) {
  try {
    // First, try to get metadata from the session
    let { projectId, stepId } = session.metadata;

    // If metadata is not in the session, try to get it from the payment intent
    if (!projectId || !stepId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent
      );
      ({ projectId, stepId } = paymentIntent.metadata);
    }

    console.log(
      `Attempting to update project step: ${stepId} for project: ${projectId}`
    );

    if (!projectId || !stepId) {
      console.error(
        "Missing projectId or stepId in both session and payment intent metadata"
      );
      return;
    }

    const updatedStep = await ProjectStep.update(
      {
        status: "COMPLETED",
        paymentStatus: "PAID",
        completedAt: new Date(),
      },
      {
        where: { id: stepId, projectId: projectId },
        returning: true,
      }
    );

    console.log("Update result:", JSON.stringify(updatedStep, null, 2));

    if (updatedStep[0] === 0) {
      console.error(
        "No project step was updated. Check if the stepId and projectId are correct."
      );
    } else {
      console.log(
        "Project step updated successfully:",
        JSON.stringify(updatedStep[1][0], null, 2)
      );
    }
  } catch (error) {
    console.error("Error updating project step:", error);
    console.error("Error details:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent) {
  // Add any necessary handling for successful payment intents
  console.log("Handling successful payment intent:", paymentIntent.id);
  // You might want to update the project step here as well, similar to handleCheckoutSessionCompleted
}

router.post("/create-stripe-account", authenticateToken, async (req, res) => {
  const { email } = req.body;

  try {
    const companyId = req.user.id;

    const user = await User.findByPk(companyId);
    if (user.role !== "COMPANY") {
      return res
        .status(403)
        .json({ message: "Only company should create stripe account" });
    }
    
    // Create a connected account
    const account = await stripe.accounts.create({
      type: "standard",
      country: "MY",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Update the account ID and onboarding status in your database
    await CompanyDetail.update(
      {
        stripeAccountId: account.id,
        stripeOnboardingComplete: false,
        updatedAt: new Date(),
      },
      {
        where: { userId: req.user.id },
      }
    );

    // Generate an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/company-dashboard/stripe-onboarding`,
      return_url: `${process.env.FRONTEND_URL}/company-dashboard`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    res.status(500).json({
      message: "Failed to create Stripe account.",
      error: error.message,
    });
  }
});

router.get("/check-onboarding-status", authenticateToken, async (req, res) => {
  try {
    const companyDetail = await CompanyDetail.findOne({
      where: { userId: req.user.id },
    });

    if (!companyDetail || !companyDetail.stripeAccountId) {
      return res
        .status(404)
        .json({ message: "No Stripe account found for this company." });
    }

    const account = await stripe.accounts.retrieve(
      companyDetail.stripeAccountId
    );
    const isOnboardingComplete =
      account.details_submitted && account.payouts_enabled;

    if (isOnboardingComplete && !companyDetail.stripeOnboardingComplete) {
      await CompanyDetail.update(
        { stripeOnboardingComplete: true },
        { where: { userId: req.user.id } }
      );
    }

    res.json({ isOnboardingComplete });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    res.status(500).json({
      message: "Failed to check onboarding status.",
      error: error.message,
    });
  }
});

router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  const { projectId, stepId } = req.body;

  try {
    const consumerId = req.user.id;

    // Fetch user information to check their role
    const user = await User.findByPk(consumerId);

    if (user.role !== "CONSUMER") {
      return res
        .status(403)
        .json({ message: "Only consumers should make payment" });
    }

    // Find the step and company information
    const projectStep = await ProjectStep.findOne({
      where: { id: stepId, projectId },
    });
    const project = await Project.findOne({ where: { id: projectId } });
    const companyDetail = await CompanyDetail.findOne({
      where: { userId: project.companyId },
    });

    if (!projectStep || !companyDetail) {
      return res.status(404).json({ message: "Project or step not found." });
    }

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "grabpay", "fpx"],
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: projectStep.stepName,
              description: projectStep.description,
            },
            unit_amount: Math.round(projectStep.paymentAmount * 100), // Stripe uses smallest currency unit
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/consumer-dashboard/consumer-project/${projectId}`,
      cancel_url: `${process.env.FRONTEND_URL}/consumer-dashboard/consumer-project/${projectId}`,
      metadata: {
        projectId: projectId,
        stepId: stepId,
      },
      payment_intent_data: {
        application_fee_amount: 0, // Example fee (in smallest currency unit)
        transfer_data: {
          destination: companyDetail.stripeAccountId,
        },
        metadata: {
          projectId: projectId,
          stepId: stepId,
        },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      message: "Failed to create checkout session.",
      error: error.message,
    });
  }
});

module.exports = router;
