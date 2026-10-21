import {db,json,token,digest,limited,sameOrigin,gameSession,cleanRunSummary,validAnswers,evaluate,serverFailure} from "../../../lib/game-server";

// Progress stays on the player's browser; only validate its own session and completion.
export async function GET(req:Request){
 try{
  if(!sameOrigin(req))return json({error:"잘못된 요청입니다."},403);
  const s=await gameSession(req);
  if(!s)return json({error:"저장된 플레이를 확인할 수 없어요. 새로 시작해주세요."},401);
  const entered=!!await db().prepare("SELECT session_id FROM raffle_entries WHERE session_id=?").bind(s.id).first();
  return json({id:s.id,completed:!!s.completed_at,score:s.score,grade:s.grade,entered});
 }catch(e){return serverFailure(e);}
}

export async function POST(req:Request){
 try{
  if(!sameOrigin(req))return json({error:"잘못된 요청입니다."},403);
  const b=await req.json() as Record<string,unknown>;
  if(b.action==="start"){
   if(await limited(req,"start",600,900000))return json({error:"잠시 쉬었다가 다시 시작해주세요."},429);
   const id=crypto.randomUUID(),secret=token(),now=Date.now();
   await db().prepare("INSERT INTO game_sessions (id,token_hash,started_at,updated_at,progress) VALUES (?,?,?,?,?)").bind(id,await digest(secret),now,now,"{}").run();
   return json({id,token:secret},201);
  }
  if(b.action!=="finish")return json({error:"지원하지 않는 요청입니다."},400);
  const s=await gameSession(req);
  if(!s)return json({error:"플레이 정보를 다시 확인해주세요."},401);
  if(!validAnswers(b.answers))return json({error:"다섯 질문에 모두 답해주세요."},400);
  if(s.completed_at)return json({ok:true,score:s.score,grade:s.grade});
  const result=evaluate(b.answers),summary=cleanRunSummary(b.summary);
  // Retrying after navigation cannot overwrite an already completed report.
  await db().prepare("UPDATE game_sessions SET completed_at=?,updated_at=?,score=?,grade=?,clues=?,messenger_hints=?,phone_hints=?,progress=? WHERE id=? AND completed_at IS NULL").bind(Date.now(),Date.now(),result.score,result.grade,summary.found.length,summary.msgHints,summary.callHints,"{}",s.id).run();
  const finished=await gameSession(req);
  return json({ok:true,score:finished?.score??result.score,grade:finished?.grade??result.grade});
 }catch(e){return serverFailure(e);}
}
