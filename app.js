function $(sel, root=document){ return root.querySelector(sel); }
function toast(msg){
  const el=document.getElementById("toast");
  if(!el){ alert(msg); return; }
  el.textContent=msg; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2400);
}
async function fileToDataURL(file){
  return await new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onload=()=>res(fr.result);
    fr.onerror=rej;
    fr.readAsDataURL(file);
  });
}
