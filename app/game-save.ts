import type {ClueId} from "./game-data";

export const SAVE_KEY = "handover-v3-save";
export type Credential = {id:string;token:string};
export type PhoneProgress = {kind:"call"|"ending";phase:"dialing"|"connected"|"ended";step:number};
export type RunProgress = {
 screen:string;line:string;found:ClueId[];answers:number[];qIndex:number;reportedAt:number;
 msgHints:number;callHints:number;prologue:number;search:string;searched:boolean;
 preview:{name:string;from:string;record?:{number:string;date:string}}|null;
 chatHistory:{id:number;question:string;reply:string}[];
 contact:"msg"|"call"|"ending"|null;phoneProgress:PhoneProgress|null;
};
export type SavedRun = {version:1;savedAt:number;credential:Credential;progress:RunProgress};
export type SessionStatus = {id:string;completed:boolean;score:number|null;grade:string|null;entered:boolean};
const screens=new Set(["prologue","desktop","folders","fire-folder","safety-folder","drawing-folder","drawing-sub","file-preview","registry","draft","plan","result","fire-plan","route","clues","report","auto-call","boss","boss-reply","score","ending","final","raffle","raffle-done"]);
const finishedScreens=new Set(["score","ending","final","raffle","raffle-done"]);
const record=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:{};
const text=(v:unknown,max=400)=>typeof v==="string"?v.slice(0,max):"";
const count=(v:unknown,max:number)=>Number.isInteger(v)?Math.max(0,Math.min(max,v as number)):0;

// Only allow game state into the checkpoint. Raffle fields and consent are never copied.
export function parseSavedRun(raw:string|null):SavedRun|null{
 if(!raw||raw.length>100_000)return null;
 try{
  const s=record(JSON.parse(raw)),c=record(s.credential),p=record(s.progress);
  if(s.version!==1||typeof c.id!=="string"||!/^[-a-f0-9]{36}$/.test(c.id)||typeof c.token!=="string"||!/^[a-f0-9]{64}$/.test(c.token)||typeof s.savedAt!=="number"||!Number.isFinite(s.savedAt))return null;
  if(typeof p.screen!=="string"||!screens.has(p.screen)||!Array.isArray(p.answers)||p.answers.length>5||!p.answers.every(a=>Number.isInteger(a)&&a>=0&&a<3))return null;
  let screen=p.screen;
  const answers=p.answers as number[],found=[...new Set(Array.isArray(p.found)?p.found.filter((id):id is ClueId=>typeof id==="string"&&/^c([1-9]|10)$/.test(id)):[])];
  if(finishedScreens.has(screen)&&answers.length!==5)return null;
  if(screen==="boss"&&answers.length===5)screen="boss-reply";
  if(screen==="boss-reply"&&!answers.length)screen="boss";
  const qIndex=screen==="boss-reply"?Math.max(0,answers.length-1):screen==="boss"?answers.length:count(p.qIndex,4);
  const f=record(p.preview),r=record(f.record);
  const preview=typeof f.name==="string"&&typeof f.from==="string"&&screens.has(f.from)&&f.from!=="file-preview"?{name:text(f.name,200),from:f.from,...(typeof r.number==="string"?{record:{number:text(r.number,80),date:text(r.date,30)}}:{})}:null;
  if(screen==="file-preview"&&!preview)screen="folders";
  const chatHistory=(Array.isArray(p.chatHistory)?p.chatHistory:[]).slice(-25).map(record).filter(h=>typeof h.id==="number"&&Number.isFinite(h.id)&&typeof h.question==="string"&&typeof h.reply==="string").map(h=>({id:h.id as number,question:text(h.question,160),reply:text(h.reply,600)}));
  const contact=p.contact==="msg"||p.contact==="call"||p.contact==="ending"&&screen==="ending"?p.contact:null;
  const call=record(p.phoneProgress);
  const phoneProgress=(contact==="call"||contact==="ending")&&call.kind===contact&&(call.phase==="dialing"||call.phase==="connected"||call.phase==="ended")?{kind:contact,phase:call.phase,step:count(call.step,2)} as PhoneProgress:null;
  return {version:1,savedAt:s.savedAt,credential:{id:c.id,token:c.token},progress:{screen,line:text(p.line),found,answers,qIndex,reportedAt:count(p.reportedAt,10),msgHints:count(p.msgHints,999),callHints:count(p.callHints,999),prologue:count(p.prologue,2),search:text(p.search,200),searched:p.searched===true,preview,chatHistory,contact,phoneProgress}};
 }catch{return null;}
}

export function makeSavedRun(credential:Credential,progress:RunProgress):SavedRun|null{
 return parseSavedRun(JSON.stringify({version:1,savedAt:Date.now(),credential,progress}));
}

// A completion/raffle request may have reached the server just before the page closed.
export function reconcileSavedRun(saved:SavedRun,status:SessionStatus):RunProgress{
 const p=saved.progress;
 if(status.id!==saved.credential.id)throw new Error("저장된 플레이 정보를 확인할 수 없어요.");
 if(status.entered)return {...p,screen:"raffle-done",contact:null,phoneProgress:null};
 if(status.completed&&!finishedScreens.has(p.screen))return {...p,screen:"score",contact:null,phoneProgress:null};
 if(!status.completed&&finishedScreens.has(p.screen))return {...p,screen:"boss-reply",qIndex:4,contact:null,phoneProgress:null};
 return p;
}

export function savedRunLabel(saved:SavedRun){
 const p=saved.progress;
 if(p.screen==="raffle-done")return "첫 업무 완료 · 응모 완료";
 if(finishedScreens.has(p.screen))return "보고 완료 · 엔딩 이어보기";
 if(p.screen==="boss"||p.screen==="boss-reply")return `팀장 보고 ${p.answers.length}/5 · 단서 ${p.found.length}/10`;
 if(p.screen==="prologue")return `첫 출근 · 도입 ${p.prologue+1}/3`;
 return `단서 ${p.found.length}/10 · 업무 탐색 중`;
}
