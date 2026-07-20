import { writeFile } from "node:fs/promises";
import { YOUTUBE_GRADE6_10_BATCH1_CANDIDATES as candidates } from "../src/lib/data/youtube-grade6-10-batch1-candidates";

type Result = { youtubeId:string; grade:string; subject:string; expectedTitle:string; live:boolean; liveTitle?:string; channelTitle?:string; error?:string };
async function verify(candidate: typeof candidates[number]):Promise<Result>{
  const videoUrl=`https://www.youtube.com/watch?v=${candidate.youtubeId}`;
  const endpoint=`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(videoUrl)}`;
  try{
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),12000);
    const res=await fetch(endpoint,{signal:controller.signal,headers:{"User-Agent":"NEYO-Link-Review/1.0"}}); clearTimeout(timer);
    if(!res.ok)return {...candidate,expectedTitle:candidate.title,live:false,error:`HTTP ${res.status}`};
    const data=await res.json() as {title?:string;author_name?:string};
    return {youtubeId:candidate.youtubeId,grade:candidate.grade,subject:candidate.subject,expectedTitle:candidate.title,live:true,liveTitle:data.title,channelTitle:data.author_name};
  }catch(error){return {youtubeId:candidate.youtubeId,grade:candidate.grade,subject:candidate.subject,expectedTitle:candidate.title,live:false,error:error instanceof Error?error.message:"Unknown error"};}
}
async function main(){
  const results:Result[]=[];
  for(let i=0;i<candidates.length;i+=5) results.push(...await Promise.all(candidates.slice(i,i+5).map(verify)));
  const live=results.filter(r=>r.live), unavailable=results.filter(r=>!r.live);
  const report={checkedAt:new Date().toISOString(),total:results.length,live:live.length,unavailable:unavailable.length,results};
  await writeFile("/tmp/neyo-youtube-batch1-live-report.json",JSON.stringify(report,null,2));
  console.log(JSON.stringify({total:report.total,live:report.live,unavailable:report.unavailable,reportFile:"/tmp/neyo-youtube-batch1-live-report.json"},null,2));
  if(unavailable.length)process.exitCode=2;
}
main().catch((error)=>{console.error(error);process.exit(1);});
