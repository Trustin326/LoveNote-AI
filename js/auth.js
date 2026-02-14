let sb=null;

function initClient(){
  if(sb) return sb;
  sb = window.supabase.createClient(window.LOVENOTE_SUPABASE_URL, window.LOVENOTE_SUPABASE_ANON);
  return sb;
}

async function getSession(){
  initClient();
  const { data } = await sb.auth.getSession();
  return data.session;
}

async function requireLogin(){
  const s = await getSession();
  if(!s){
    toast("Please log in.");
    setTimeout(()=>window.location.href="login.html",700);
    return null;
  }
  return s;
}

/**
 * Real gate: requires a row in lovenote_entitlements for this user with active=true.
 * Owner mode can bypass (localStorage) for you.
 */
function isOwner(){ return localStorage.getItem("lovenote_owner")==="true"; }

async function hasEntitlement(){
  if(isOwner()) return true;
  const session = await requireLogin();
  if(!session) return false;

  const { data, error } = await sb
    .from("lovenote_entitlements")
    .select("active,plan,expires_at")
    .eq("user_id", session.user.id)
    .eq("active", true)
    .maybeSingle();

  if(error){ console.warn(error); return false; }
  return !!data?.active;
}

async function requirePaid(){
  const ok = await hasEntitlement();
  if(!ok){
    toast("Locked. Purchase required.");
    setTimeout(()=>window.location.href="index.html#pricing",900);
    return false;
  }
  return true;
}
