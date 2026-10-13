const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let lang=localStorage.lang||"en",info=null,kind="video",q=1080;
const L=k=>LANG[lang][k];
const ic=(n,c="white")=>`https://api.iconify.design/${n}.svg?color=${c}`;
let lib;try{lib=JSON.parse(localStorage.lib)}catch{lib=[]}
const save=()=>localStorage.lib=JSON.stringify(lib.slice(0,100));
const esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function applyLang(){
  document.documentElement.lang=lang;document.documentElement.dir=L("dir");
  $$("[data-i18n]").forEach(e=>e.textContent=L(e.dataset.i18n));
  $("#langBtn").textContent=lang=="en"?"اردو":"English";
  $("#featGrid").innerHTML=L("feat").map(f=>`<div class="ft"><img src="${ic(f[0],"%23FF3D8B")}" alt=""><b>${f[1]}</b><p>${f[2]}</p></div>`).join("");
  renderLib();renderSign();
}
$("#platGrid").innerHTML=PLATFORMS.map(p=>`<div class="pl" style="--c:${p[2]}"><img src="${p[1]}" alt=""><b>${p[0]}</b><small>${p[3]}</small></div>`).join("");
$("#langBtn").onclick=()=>{lang=lang=="en"?"ur":"en";localStorage.lang=lang;applyLang()};

const msg=t=>$("#msg").textContent=t||"";
$("#pasteBtn").onclick=async()=>{try{$("#url").value=await navigator.clipboard.readText();fetchInfo()}catch{$("#url").focus()}};
$("#goBtn").onclick=fetchInfo;
$("#url").onkeydown=e=>e.key=="Enter"&&fetchInfo();
$("#url").onpaste=()=>setTimeout(fetchInfo,50);

async function fetchInfo(){
  const u=$("#url").value.trim();
  if(!/^https?:\/\//i.test(u)){msg(L("bad"));return}
  msg(L("loading"));$("#preview").hidden=true;
  try{
    const r=await fetch("/api/info?url="+encodeURIComponent(u));
    if(!r.ok)throw 0;info=await r.json();info.url=u;
    $("#pvImg").src=info.thumbnail||"";$("#pvTitle").textContent=info.title;
    $("#pvSrc").textContent=info.platform;
    $("#pvDur").textContent=info.duration?new Date(info.duration*1000).toISOString().slice(info.duration>3599?11:14,19):"";
    $("#dlVideo").hidden=!info.hasVideo;
    $("#preview").hidden=false;msg("");
  }catch{msg(L("fail"))}
}

$$("[data-close]").forEach(b=>b.onclick=()=>{const t=b.dataset.close;t=="drawer"?closeDrawer():$("#"+t).hidden=true});
$("#dlVideo").onclick=()=>{setKind("video");buildQ();$("#qModal").hidden=false};
$("#dlPhoto").onclick=()=>startDownload("photo");
function setKind(k){
  kind=k;$$("#kindSeg button").forEach(b=>b.classList.toggle("on",b.dataset.kind==k));
  $("#qSeg").style.display=k=="audio"?"none":"flex";
}
$$("#kindSeg button").forEach(b=>b.onclick=()=>setKind(b.dataset.kind));
function buildQ(){
  const max=Math.min(1080,info.maxHeight||1080);
  const opts=[1080,720,480,360,240,144].filter(h=>h<=max);
  if(!opts.length)opts.push(144);
  q=opts[0];
  $("#qSeg").innerHTML=opts.map((h,i)=>`<button data-h="${h}" class="${i?"":"on"}">${h}p</button>`).join("");
  $$("#qSeg button").forEach(b=>b.onclick=()=>{q=+b.dataset.h;$$("#qSeg button").forEach(x=>x.classList.toggle("on",x==b))});
}
$("#startDl").onclick=()=>{$("#qModal").hidden=true;startDownload(kind)};

async function startDownload(type){
  const item={id:Date.now(),title:info.title,thumb:info.thumbnail,type,q:type=="video"?q:null,pct:0,state:"prep"};
  lib.unshift(item);save();renderLib();openDrawer();
  const ext={video:"mp4",audio:"mp3",photo:"jpg"}[type];
  try{
    const p=new URLSearchParams({url:info.url,type,quality:item.q||""});
    const r=await fetch("/api/download?"+p);if(!r.ok)throw 0;
    const total=+r.headers.get("x-filesize")||0;
    const rd=r.body.getReader(),parts=[];let got=0;item.state="load";
    for(;;){const{done,value}=await rd.read();if(done)break;parts.push(value);got+=value.length;
      item.pct=total?Math.min(99,Math.round(got/total*100)):0;updateItem(item)}
    const blob=new Blob(parts),name=(info.title||"file").replace(/[\\/:*?"<>|]/g,"").slice(0,80)+"."+ext;
    const file=new File([blob],name,{type:blob.type});
    if(/Android|iPhone|iPad/i.test(navigator.userAgent)&&navigator.canShare&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file]})}catch{}}
    else{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click()}
    item.pct=100;item.state="done";
  }catch{item.state="err"}
  save();renderLib();
}
function updateItem(it){const e=document.getElementById("li"+it.id);if(e){e.querySelector("i").style.width=it.pct+"%";e.querySelector("small").textContent=it.pct+"%"}}
function renderLib(){
  $("#libCount").textContent=lib.length;
  $("#libList").innerHTML=lib.length?lib.map(it=>`<div class="li" id="li${it.id}"><img src="${esc(it.thumb)||ic("lucide:film")}" alt=""><div><b>${esc(it.title)}</b><div class="bar"><i style="width:${it.pct}%"></i></div><small>${it.state=="done"?L("done"):it.state=="err"?L("err"):it.state=="prep"?L("prep"):it.pct+"%"} - ${it.type}${it.q?" "+it.q+"p":""}</small></div></div>`).join(""):`<p style="color:var(--mute)">${L("empty")}</p>`;
}
function openDrawer(){$("#drawer").classList.add("open")}
function closeDrawer(){$("#drawer").classList.remove("open")}
$("#libBtn").onclick=openDrawer;

function renderSign(){
  const m=localStorage.mail;$("#signForm").hidden=!!m;$("#signedBox").hidden=!m;
  if(m)$("#who").textContent=L("signedAs")+" "+m;
}
$("#signBtn").onclick=()=>$("#sModal").hidden=false;
$("#saveMail").onclick=()=>{const v=$("#mail").value.trim();if(/^\S+@\S+\.\S+$/.test(v)){localStorage.mail=v;renderSign()}};
$("#signOut").onclick=()=>{localStorage.removeItem("mail");renderSign()};
applyLang();
