async function startCheckout(plan){
  // Requires Netlify Functions (or any serverless endpoint) using your Stripe secret key.
  // This endpoint returns { url } for redirect to Stripe Checkout.
  try{
    const r = await fetch(`/.netlify/functions/create-checkout-session?plan=${encodeURIComponent(plan)}`, { method:"POST" });
    const j = await r.json();
    if(!r.ok) throw new Error(j.error||"Checkout error");
    window.location.href = j.url;
  }catch(e){
    console.error(e);
    toast("Checkout not configured yet. Deploy on Netlify & set STRIPE_SECRET_KEY.");
  }
}
