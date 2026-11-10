"use client";
import {useEffect,useLayoutEffect,useRef} from "react";

export type GameView={
 screen:string;line:string;prologue:number;
 preview:{name:string;from:string;record?:{number:string;date:string}}|null;
 contact:"msg"|"call"|"ending"|null;
 restartPrompt:boolean;raffleInvitation:boolean;review:boolean;
};
type Entry={version:1;session:string;index:number;epoch:string;view:GameView};
type BrowserHost=Pick<Window,"history"|"addEventListener"|"removeEventListener">;
const historyKey="handoverNavigation";
const reportScreens=new Set(["boss","boss-reply","score","ending","final"]);
const parents:Record<string,string>={draft:"fire-folder",plan:"registry",result:"registry","fire-plan":"safety-folder",route:"drawing-sub","fire-folder":"folders","safety-folder":"folders","drawing-folder":"folders","drawing-sub":"drawing-folder",folders:"desktop",registry:"desktop",clues:"desktop",report:"desktop","auto-call":"desktop",raffle:"final","raffle-done":"final"};
const key=(view:GameView)=>JSON.stringify([view.screen,view.screen==="prologue"?view.prologue:0,view.screen==="file-preview"?view.preview:null,view.contact,view.restartPrompt,view.raffleInvitation,view.review]);
const entryOf=(state:unknown):Entry|null=>{
 const entry=(state as Record<string,Entry>|null)?.[historyKey];
 return entry?.version===1&&typeof entry.session==="string"&&Number.isSafeInteger(entry.index)&&entry.index>=0&&typeof entry.epoch==="string"&&typeof entry.view?.screen==="string"?entry:null;
};
const plainView=(view:GameView,screen=view.screen):GameView=>({...view,screen,contact:null,restartPrompt:false,raffleInvitation:false,review:false});

// Resume builds a finite path, so Back can reach the document's list after a reload.
function resumePath(view:GameView){
 const base=plainView(view),path:GameView[]=[];
 let screen=view.screen==="file-preview"?view.preview?.from:parents[view.screen];
 while(screen&&screen!=="intro"&&path.length<8){path.unshift(plainView(view,screen));screen=parents[screen];}
 if(view.screen==="prologue")for(let step=0;step<view.prologue;step++)path.push({...base,prologue:step});
 path.push(base);
 if(key(base)!==key(view))path.push(view);
 return path;
}

// Real, finite history entries: popstate only consumes existing entries. Pushing
// another guard during Back is skipped by Chromium's history intervention.
// Store navigation only; answers, clues, credentials and raffle data stay separate.
export function installGameHistory(host:BrowserHost,initial:GameView,initialEpoch:string,restore:(view:GameView)=>void,isBusy:()=>boolean){
 const old=entryOf(host.history.state),rootIndex=old?.index??0;
 const session=old?.session??crypto.randomUUID();
 let current:Entry={version:1,session,index:rootIndex,epoch:initialEpoch,view:initial};
 let epoch=initialEpoch,restoring=false,pending:GameView|null=null;
 const entries=new Map<number,Entry>([[rootIndex,current]]);
 const replace=(view:GameView)=>{
  current={...current,epoch,view};entries.set(current.index,current);
  host.history.replaceState({...host.history.state,[historyKey]:current},"");
 };
 const push=(view:GameView)=>{
  for(const index of entries.keys())if(index>current.index)entries.delete(index);
  current={...current,index:current.index+1,epoch,view};entries.set(current.index,current);
  host.history.pushState({...host.history.state,[historyKey]:current},"");
 };
 replace(initial);
 const pop=(event:PopStateEvent)=>{
  const target=entryOf(event.state);
  if(!target||target.session!==session)return;
  if(target.index<rootIndex){host.history.go(-target.index-1);return;}
  if(isBusy()&&target.index!==current.index){host.history.go(current.index-target.index);return;}
  current=target;
  if(target.index>rootIndex&&target.epoch!==epoch){host.history.go(rootIndex-target.index);return;}
  const view=pending??(target.index===rootIndex?plainView(initial,"intro"):target.view);
  pending=null;restoring=true;replace(view);restore(view);
 };
 host.addEventListener("popstate",pop);
 return {
  sync(view:GameView,nextEpoch:string){
   epoch=nextEpoch;
   if(restoring){restoring=false;replace(view);return;}
   if(key(view)===key(current.view)){replace(view);return;}
   if(view.screen==="intro"&&!view.restartPrompt&&current.index>rootIndex){pending=view;host.history.go(rootIndex-current.index);return;}
   const previous=[...entries.values()].reverse().find(e=>e.index<current.index&&e.index>=rootIndex&&e.epoch===epoch&&key(e.view)===key(view));
   if(previous){pending=view;host.history.go(previous.index-current.index);return;}
   if(current.view.screen==="intro"&&!current.view.restartPrompt&&view.screen!=="intro"){
    for(const step of resumePath(view))push(step);
   }else if(reportScreens.has(current.view.screen)&&reportScreens.has(view.screen)&&!current.view.contact&&!view.contact&&!current.view.raffleInvitation&&!view.raffleInvitation&&!current.view.review&&!view.review){
    // Reports advance one authoritative checkpoint, never historical answer pages.
    replace(view);
   }else push(view);
  },
  dispose:()=>host.removeEventListener("popstate",pop)
 };
}

export function useBrowserBack(view:GameView,epoch:string,busy:boolean,restore:(view:GameView)=>void){
 const latest=useRef({view,epoch,busy,restore});
 const navigation=useRef<ReturnType<typeof installGameHistory>|null>(null);
 useLayoutEffect(()=>{latest.current={view,epoch,busy,restore};});
 useEffect(()=>{
  const state=latest.current;
  const controller=installGameHistory(window,state.view,state.epoch,v=>latest.current.restore(v),()=>latest.current.busy);
  navigation.current=controller;
  return()=>{controller.dispose();navigation.current=null;};
 },[]);
 useLayoutEffect(()=>{navigation.current?.sync(view,epoch);},[view,epoch]);
}
