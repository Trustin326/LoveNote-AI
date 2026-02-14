window.addEventListener("DOMContentLoaded", async ()=>{
  initClient();
  const ok = await requirePaid();
  if(!ok) return;

  $("#openClose").addEventListener("click", ()=>$("#liveCard").classList.toggle("open"));
  $("#animSel").addEventListener("change",(e)=>$("#danceChar").setAttribute("data-anim",e.target.value));
  $("#charSel").addEventListener("change",(e)=>$("#danceChar").setAttribute("data-char",e.target.value));
  $("#downloadSnap").addEventListener("click", ()=>{
    toast("Snapshot download is available in Deluxe server build (kept lightweight here).");
  });
});
