async function bindLogout(){
  const sb = initClient();
  document.getElementById("logoutBtn").addEventListener("click", async ()=>{
    try{ await sb.auth.signOut(); }catch(e){}
    toast("Logged out");
    setTimeout(()=>window.location.href="index.html",600);
  });
}

async function showUserAndBadge(){
  const s = await requireLogin();
  if(!s) return;
  document.getElementById("userEmail").textContent = s.user.email || "Logged in";
  const b=document.getElementById("paidBadge");
  const ok = await hasEntitlement();
  b.textContent = ok ? "ACTIVE" : "LOCKED";
  b.style.background = ok ? "rgba(16,185,129,.12)" : "rgba(255,47,159,.10)";
  b.style.borderColor = ok ? "rgba(16,185,129,.28)" : "rgba(255,47,159,.18)";
  b.style.color = ok ? "rgb(16,185,129)" : "#ff2f9f";
}

async function saveEvent(type,payload){
  try{
    const session = await getSession();
    if(!session) return;
    const sb = initClient();
    await sb.from("lovenote_events").insert([{ user_id: session.user.id, type, payload }]);
  }catch(e){}
}

function drawMeme(img, top, bottom){
  const c=document.getElementById("memeCanvas"); const ctx=c.getContext("2d");
  const maxW=720; const scale=Math.min(maxW/img.width,1);
  c.width=Math.floor(img.width*scale); c.height=Math.floor(img.height*scale);
  ctx.drawImage(img,0,0,c.width,c.height);
  ctx.textAlign="center";
  ctx.fillStyle="white"; ctx.strokeStyle="black";
  ctx.lineWidth=Math.max(3,c.width*0.01);
  ctx.font=`900 ${Math.max(22,c.width*0.06)}px Arial`;
  const t=(s,y)=>{ if(!s) return; ctx.strokeText(s.toUpperCase(),c.width/2,y); ctx.fillText(s.toUpperCase(),c.width/2,y); };
  t(top,48); t(bottom,c.height-22);
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function wrapText(ctx,text,x,y,maxWidth,lineHeight){
  const words=(text||"").split(" ");
  let line="";
  for(let n=0;n<words.length;n++){
    const test=line+words[n]+" ";
    if(ctx.measureText(test).width>maxWidth && n>0){
      ctx.fillText(line,x,y);
      line=words[n]+" ";
      y+=lineHeight;
    }else line=test;
  }
  ctx.fillText(line,x,y);
}

async function bindTools(){
  // Gate everything
  const ok = await requirePaid();
  if(!ok) return;

  // Message
  document.getElementById("msgSend").addEventListener("click", async ()=>{
    const name=$("#msgName").value.trim()||"Friend";
    const tone=$("#msgTone").value;
    const msg = tone==="Romantic"
      ? `Hey ${name} 💖 You’re my favorite person — always.`
      : tone==="Funny"
      ? `Yo ${name} 😄 If kisses were currency, I’d be rich.`
      : `Hi ${name} ✨ Just wanted to say you make everything better.`;

    try{ await navigator.clipboard.writeText(msg); }catch(e){}
    $("#msgResult").innerHTML = `<div class="badge">Message copied</div>
      <div style="margin-top:10px"><a class="btn" style="display:inline-block;text-decoration:none" href="sms:&body=${encodeURIComponent(msg)}">Send via SMS</a></div>`;
    await saveEvent("message_send",{tone});
    toast("Message ready!");
  });

  // Meme
  $("#memeGen").addEventListener("click", async ()=>{
    const f=$("#memeImg").files?.[0];
    if(!f){ toast("Upload an image first"); return; }
    const data=await fileToDataURL(f);
    const img=new Image();
    img.onload=async ()=>{
      drawMeme(img,$("#memeTop").value,$("#memeBottom").value);
      $("#memeDownload").style.display="inline-flex";
      $("#memeSend").style.display="inline-flex";
      toast("Meme generated!");
      await saveEvent("meme_generate",{});
    };
    img.src=data;
  });
  $("#memeDownload").addEventListener("click", ()=>{
    const a=document.createElement("a");
    a.download="lovenote-meme.png";
    a.href=$("#memeCanvas").toDataURL("image/png");
    a.click();
  });
  $("#memeSend").addEventListener("click", ()=>{
    window.location.href=`sms:&body=${encodeURIComponent("Made with LoveNote AI 💖 (attach your downloaded meme)")}`;
  });

  // Card
  const c=$("#cardCanvas"); const ctx=c.getContext("2d");
  $("#cardCreate").addEventListener("click", async ()=>{
    const name=$("#cardName").value.trim()||"My Favorite Person";
    const msg=$("#cardMsg").value.trim()||"Roses are red, Violets are blue… 💖";
    let charSrc=$("#cardChar").src;
    const f=$("#cardImg").files?.[0];
    if(f) charSrc=await fileToDataURL(f);

    c.width=900; c.height=560;
    const g=ctx.createLinearGradient(0,0,900,560);
    g.addColorStop(0,"#fff"); g.addColorStop(0.35,"#ffe7f4"); g.addColorStop(1,"#d9f3ff");
    ctx.fillStyle=g; ctx.fillRect(0,0,900,560);
    ctx.strokeStyle="rgba(255,47,159,.35)"; ctx.lineWidth=14;
    roundRect(ctx,20,20,860,520,40); ctx.stroke();

    ctx.fillStyle="#ff2f9f"; ctx.font="900 44px Arial"; ctx.fillText("LoveNote AI",48,86);
    ctx.fillStyle="#111827"; ctx.font="900 34px Arial"; ctx.fillText(`For: ${name}`,48,140);

    ctx.fillStyle="rgba(255,255,255,.88)";
    ctx.strokeStyle="rgba(255,47,159,.25)"; ctx.lineWidth=4;
    roundRect(ctx,48,175,520,320,26); ctx.fill(); ctx.stroke();

    ctx.fillStyle="#111827"; ctx.font="700 28px Arial";
    wrapText(ctx,msg.replace(/\n/g," "),80,225,460,36);

    const im=new Image();
    im.onload=async ()=>{
      ctx.drawImage(im,600,190,300,300);
      $("#cardDownload").style.display="inline-flex";
      $("#cardSend").style.display="inline-flex";
      toast("Card ready!");
      await saveEvent("card_create",{});
    };
    im.src=charSrc;
  });
  $("#cardDownload").addEventListener("click", ()=>{
    const a=document.createElement("a");
    a.download="lovenote-card.png";
    a.href=c.toDataURL("image/png");
    a.click();
  });
  $("#cardSend").addEventListener("click", ()=>{
    window.location.href=`sms:&body=${encodeURIComponent("I made you a card 💖 (attach downloaded PNG)")}`;
  });
  $("#cardUpsell").addEventListener("click", ()=>window.location.href="upsell.html");

  // Photo transform (client-side preview filters)
  const filters={
    "Dreamy Romantic":"contrast(1.08) saturate(1.15) brightness(1.05) hue-rotate(-10deg)",
    "Anime":"contrast(1.15) saturate(1.35) brightness(1.05)",
    "Pixar Style":"contrast(1.12) saturate(1.22) brightness(1.06)",
    "Soft Glow":"contrast(1.05) saturate(1.10) brightness(1.08)"
  };
  $("#ptGo").addEventListener("click", async ()=>{
    const f=$("#ptImg").files?.[0];
    if(!f){ toast("Upload a photo first"); return; }
    const url=await fileToDataURL(f);
    $("#ptPreview").src=url;
    $("#ptPreview").style.filter=filters[$("#ptStyle").value]||"none";
    $("#ptDownload").style.display="inline-flex";
    $("#ptSend").style.display="inline-flex";
    toast("Preview ready!");
    await saveEvent("photo_transform",{});
  });
  $("#ptDownload").addEventListener("click", ()=>{
    const im=new Image();
    im.onload=()=>{
      const c=document.createElement("canvas"); const ctx=c.getContext("2d");
      const maxW=1000; const scale=Math.min(maxW/im.width,1);
      c.width=Math.floor(im.width*scale); c.height=Math.floor(im.height*scale);
      ctx.filter=$("#ptPreview").style.filter||"none";
      ctx.drawImage(im,0,0,c.width,c.height);
      const a=document.createElement("a");
      a.download="lovenote-transform.png";
      a.href=c.toDataURL("image/png");
      a.click();
    };
    im.src=$("#ptPreview").src;
  });
  $("#ptSend").addEventListener("click", ()=>{
    window.location.href=`sms:&body=${encodeURIComponent("Made with LoveNote AI 💖 (attach your downloaded image)")}`;
  });
}

window.addEventListener("DOMContentLoaded", async ()=>{
  initClient();
  await showUserAndBadge();
  await bindLogout();
  await bindTools();
});
