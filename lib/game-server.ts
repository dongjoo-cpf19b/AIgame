import { env } from "cloudflare:workers";
import { questions } from "../app/game-data";
export const CONSENT_VERSION="2026-10-21";
export function db(){if(!env.DB)throw new Error("database_unavailable");return env.DB;}
export function json(data:unknown,status=200,headers:Record<string,string>={}){return Response.json(data,{status,headers:{"Cache-Control":"no-store",...headers}});}
export async function digest(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,"0")).join("");}
export function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,"0")).join("");}
export function sameOrigin(req:Request){const origin=req.headers.get("origin");return !origin||origin===new URL(req.url).origin;}
export async function limited(req:Request,kind:string,max:number,windowMs:number){const now=Date.now(),key=await digest(kind+":"+(req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown"));const row=await db().prepare("INSERT INTO rate_limits (key,count,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END RETURNING count").bind(key,now+windowMs,now,now).first<{count:number}>();return(row?.count??max+1)>max;}
export async function gameSession(req:Request){const b=req.headers.get("authorization")?.replace(/^Bearer /,"");if(!b||!/^[a-f0-9]{64}$/.test(b))return null;return db().prepare("SELECT id,started_at,completed_at,score,grade FROM game_sessions WHERE token_hash=?").bind(await digest(b)).first<{id:string;started_at:number;completed_at:number|null;score:number|null;grade:string|null}>();}
export async function isAdmin(req:Request){const value=req.headers.get("cookie")?.match(/(?:^|;\s*)handover_admin=([a-f0-9]{64})(?:;|$)/)?.[1];if(!value)return false;return !!await db().prepare("SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires_at>?").bind(await digest(value),Date.now()).first();}
export async function log(action:string,detail:string){await db().prepare("INSERT INTO audit_log (id,action,detail,created_at) VALUES (?,?,?,?)").bind(crypto.randomUUID(),action,detail,Date.now()).run();}
export function grade(score:number){return score===5?"S":score===4?"A":score>=2?"B":"C";}
export function validAnswers(a:unknown):a is number[]{return Array.isArray(a)&&a.length===5&&a.every(v=>Number.isInteger(v)&&v>=0&&v<3);}
export function evaluate(a:number[]){const score=a.reduce((n,v,i)=>n+(questions[i].correct===v?1:0),0);return{score,grade:grade(score)};}
export function cleanRunSummary(raw:unknown){
 const p=(raw&&typeof raw==="object"?raw:{}) as Record<string,unknown>;
 const found=Array.isArray(p.found)?[...new Set(p.found.filter(x=>typeof x==="string"&&/^c([1-9]|10)$/.test(x)))]:[];
 const count=(v:unknown)=>Math.min(999,Math.max(0,Number.isInteger(v)?v as number:0));
 return {found,msgHints:count(p.msgHints),callHints:count(p.callHints)};
}
export function serverFailure(error:unknown){console.error("handover request failed",error instanceof Error?error.message:"unknown");return json({error:"처리 중 문제가 생겼어요. 잠시 후 다시 시도해주세요."},500);}
