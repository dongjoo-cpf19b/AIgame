import {db,json,token,digest,limited,sameOrigin,gameSession,cleanRunSummary,validAnswers,evaluate,serverFailure} from "../../../lib/game-server";

// Each visit is a new play. Never expose a saved screen, answer or conversation.
export async function GET(){return json({error:"이 게임은 이어하기를 제공하지 않습니다."},405,{Allow:"POST"});}

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
  const result=evaluate(b.answers),summary=cleanRunSummary(b.summary);
  // Keep completion and aggregate results for raffle/admin use, never resumable progress.
  await db().prepare("UPDATE game_sessions SET completed_at=COALESCE(completed_at,?),updated_at=?,score=?,grade=?,clues=?,messenger_hints=?,phone_hints=?,progress=? WHERE id=?").bind(Date.now(),Date.now(),result.score,result.grade,summary.found.length,summary.msgHints,summary.callHints,"{}",s.id).run();
  return json({ok:true,...result});
 }catch(e){return serverFailure(e);}
}
