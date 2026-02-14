/**
 * Netlify Function: verify-session
 * Verifies Stripe Checkout session server-side and writes entitlement to Supabase.
 *
 * Env vars required:
 * - STRIPE_SECRET_KEY
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 *
 * You must also add a Stripe webhook (recommended) for reliability, but this works for success-page verification.
 */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const sessionId = body.session_id;
    if(!sessionId) return { statusCode: 400, body: JSON.stringify({ error: "Missing session_id" }) };

    const checkout = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
    if(checkout.payment_status !== "paid") {
      return { statusCode: 402, body: JSON.stringify({ error: "Not paid" }) };
    }

    // Customer email used as lookup. Buyer must log in with same email.
    const buyerEmail = (checkout.customer_details && checkout.customer_details.email) || checkout.customer_email;
    if(!buyerEmail) return { statusCode: 400, body: JSON.stringify({ error: "Missing customer email on session" }) };

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Find user by email (Admin API requires service role key).
    const { data: users, error: userErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
    if(userErr) throw userErr;
    const match = users.users.find(u => (u.email || "").toLowerCase() === buyerEmail.toLowerCase());
    if(!match) {
      return { statusCode: 200, body: JSON.stringify({ ok:true, note:"Paid, but user not found yet. Ask buyer to sign up with same email, then refresh." }) };
    }

    // Upsert entitlement
    const plan = "paid";
    const { error: upErr } = await supabase
      .from("lovenote_entitlements")
      .upsert({ user_id: match.id, active: true, plan, source: "stripe_success_verify", updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if(upErr) throw upErr;

    return { statusCode: 200, body: JSON.stringify({ ok:true } ) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
