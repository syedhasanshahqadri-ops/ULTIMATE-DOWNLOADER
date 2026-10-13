// Needs: Node 18+, yt-dlp and ffmpeg on PATH.  Run: npm install && node server.js
const express=require("express"),{execFile}=require("child_process"),fs=require("fs"),os=require("os"),path=require("path");
const app=express();app.use(express.static(path.join(__dirname,"..")));
const ok=u=>/^https?:\/\//i.test(u||"");
const run=a=>new Promise((res,rej)=>execFile("yt-dlp",a,{maxBuffer:1<<26},(e,o)=>e?rej(e):res(o)));
app.get("/api/info",async(req,res)=>{
  if(!ok(req.query.url))return res.sendStatus(400);
  try{
    const j=JSON.parse(await run(["-J","--no-playlist","--",req.query.url]));
    const hs=(j.formats||[]).map(f=>f.height||0);
    res.json({title:j.title||"Untitled",thumbnail:j.thumbnail,duration:j.duration,platform:j.extractor_key,
      hasVideo:hs.some(h=>h>0),maxHeight:Math.max(0,...hs)});
  }catch{res.sendStatus(422)}
});
app.get("/api/download",async(req,res)=>{
  const{url,type}=req.query;if(!ok(url))return res.sendStatus(400);
  const h=Math.min(1080,parseInt(req.query.quality)||1080),id="sv"+Date.now()+Math.random().toString(36).slice(2),base=path.join(os.tmpdir(),id);
  const args=["--no-playlist","-o",base+".%(ext)s"];
  if(type=="audio")args.push("-x","--audio-format","mp3");
  else if(type=="photo")args.push("--write-thumbnail","--skip-download","--convert-thumbnails","jpg");
  else args.push("-f",`bv*[height<=${h}]+ba/b[height<=${h}]`,"--merge-output-format","mp4");
  try{
    await run([...args,"--",url]);
    const f=fs.readdirSync(os.tmpdir()).find(n=>n.startsWith(id)),full=path.join(os.tmpdir(),f);
    res.set({"x-filesize":fs.statSync(full).size,"Access-Control-Expose-Headers":"x-filesize"});
    res.download(full,f,()=>fs.unlink(full,()=>{}));
  }catch{res.sendStatus(500)}
});
const PORT=process.env.PORT||3000;app.listen(PORT,"0.0.0.0",()=>console.log("SnapVault on port "+PORT));
