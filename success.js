window.addEventListener("DOMContentLoaded", async ()=>{
  const sb = initClient();
  const session = await requireLogin();
  if(!session) return;

  const params = new URLSearchParams(location.search);
  const checkout_session_id = params.get("session_id");
  if(!checkout_session_id){
    toast("Missing session id.");
    return;
  }

  try{
    const r = await fetch("/.netlify/functions/verify-session", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ session_id: checkout_session_id })
    });
    const j = await r.json();
    if(!r.ok) throw new Error(j.error||"Verification failed");

    // If verified, the backend writes entitlement in Supabase via service role.
    toast("Payment verified ✅ Unlocking…");
    setTimeout(()=>window.location.href="dashboard.html",800);
  }catch(e){
    console.error(e);
    toast("Could not verify payment yet. If you just paid, refresh in 30 seconds.");
  }
});
