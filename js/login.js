window.addEventListener("DOMContentLoaded", async ()=>{
  const sb = initClient();
  const { data } = await sb.auth.getSession();
  if(data.session){ window.location.href="dashboard.html"; return; }

  document.getElementById("loginBtn").addEventListener("click", async ()=>{
    const email=$("#email").value.trim();
    const password=$("#password").value.trim();
    if(!email||!password){ toast("Enter email + password"); return; }
    const { error } = await sb.auth.signInWithPassword({email,password});
    if(error){ toast(error.message); return; }
    toast("Logged in!");
    setTimeout(()=>window.location.href="dashboard.html",700);
  });

  document.getElementById("signupBtn").addEventListener("click", async ()=>{
    const email=$("#email").value.trim();
    const password=$("#password").value.trim();
    if(!email||!password){ toast("Enter email + password"); return; }
    const { error } = await sb.auth.signUp({email,password});
    if(error){ toast(error.message); return; }
    toast("Account created! Check email if confirmations are enabled.");
    setTimeout(()=>window.location.href="dashboard.html",900);
  });

  document.getElementById("ownerBtn").addEventListener("click", ()=>{
    localStorage.setItem("lovenote_owner","true");
    toast("Owner mode enabled");
    setTimeout(()=>window.location.href="dashboard.html",700);
  });
});
