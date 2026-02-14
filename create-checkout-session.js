/**
 * Netlify Function: create-checkout-session
 * Requires env vars:
 * - STRIPE_SECRET_KEY
 * - SITE_URL (e.g. https://your-site.netlify.app)
 * Optional:
 * - PRICE_STARTER, PRICE_CREATOR, PRICE_DELUXE (Stripe Price IDs)
 *
 * This creates a Stripe Checkout Session and redirects back to success.html?session_id=...
 */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const plan = (event.queryStringParameters?.plan || "starter").toLowerCase();
    const siteUrl = process.env.SITE_URL || "http://localhost:8888";

    const priceMap = {
      starter: process.env.PRICE_STARTER,
      creator: process.env.PRICE_CREATOR,
      deluxe: process.env.PRICE_DELUXE,
    };
    const price = priceMap[plan];
    if (!price) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing Stripe Price ID env vars (PRICE_STARTER/CREATOR/DELUXE)." }) };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/index.html#pricing`,
      allow_promotion_codes: true,
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
