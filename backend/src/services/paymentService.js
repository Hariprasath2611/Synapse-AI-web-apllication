import Stripe from 'stripe';
import Razorpay from 'razorpay';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

let stripe = null;
let razorpay = null;

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_51...') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  logger.info('Stripe billing initialized.');
}

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  logger.info('Razorpay payments initialized.');
}

export const createCheckoutSession = async ({ planId, amount, currency = 'usd', userId, gateway = 'stripe' }) => {
  if (gateway === 'stripe' && stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Synapse AI plan: ${planId}`
              },
              unit_amount: Math.round(amount * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `http://localhost:5173/dashboard/revenue?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:5173/dashboard/revenue?status=cancel`,
        metadata: { userId, planId }
      });
      return { url: session.url, id: session.id };
    } catch (error) {
      logger.error('Stripe checkout error:', error);
      throw error;
    }
  }

  if (gateway === 'razorpay' && razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // in paise
        currency: currency.toUpperCase() === 'USD' ? 'INR' : currency.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
        notes: { userId, planId }
      });
      return { id: order.id, amount: order.amount, currency: order.currency };
    } catch (error) {
      logger.error('Razorpay checkout error:', error);
      throw error;
    }
  }

  // Fallback Mock Payment Checkout
  logger.warn('Mock payment execution generated.');
  return {
    url: `http://localhost:5173/dashboard/revenue?status=success&mock_id=tx_${Math.random().toString(36).substr(2, 9)}`,
    id: `mock_tx_${Date.now()}`,
    amount,
    currency
  };
};
