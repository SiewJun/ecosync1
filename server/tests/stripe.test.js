const Stripe = require('stripe');

jest.mock('stripe');

describe('Stripe API', () => {
  let stripe;

  beforeEach(() => {
    stripe = new Stripe('fake_key');
    stripe.checkout = { sessions: { create: jest.fn() } }; // Properly mock the sessions.create method
  });

  it('should create a checkout session', async () => {
    const mockSession = { id: 'cs_test_123' };
    stripe.checkout.sessions.create.mockResolvedValue(mockSession);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'myr',
          product_data: {
            name: 'Test Product',
          },
          unit_amount: 1000,
        },
        quantity: 1,
      }],
      mode: 'payment',
    });

    expect(session.id).toBe('cs_test_123');
  });
});