"use client";
import {useCallback,useEffect,useLayoutEffect,useRef,useState} from "react";
import {SAVE_KEY,makeSavedRun,parseSavedRun,type Credential,type RunProgress,type SavedRun} from "./game-save";

export function useGameSave(credential:Credential|null,progress:RunProgress){
 const [savedRun,setSavedRun]=useState<SavedRun|null>(null),[ready,setReady]=useState(false),[saveError,setSaveError]=useState("");
 const current=useRef({credential,progress});
 useLayoutEffect(()=>{current.current={credential,progress};},[credential,progress]);
 useEffect(()=>{
  try{setSavedRun(parseSavedRun(localStorage.getItem(SAVE_KEY)));}
  catch{setSaveError("이 브라우저에서 자동 저장을 사용할 수 없어요. 저장 권한을 확인해주세요.");}
  setReady(true);
 },[]);
 const persist=useCallback(()=>{
  const {credential,progress}=current.current;
  // Returning to the title must never replace the most recent playable screen.
  if(!credential||progress.screen==="intro")return;
  const next=makeSavedRun(credential,progress);
  if(!next)return;
  setSavedRun(next);
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(next));setSaveError("");}
  catch{setSaveError("자동 저장을 완료하지 못했어요. 브라우저 저장 공간을 확인해주세요.");}
 },[]);
 // No debounce or network wait: each committed choice is saved before the next paint.
 useLayoutEffect(()=>{if(ready)persist();},[credential,progress,ready,persist]);
 useEffect(()=>{
  const hidden=()=>{if(document.visibilityState==="hidden")persist();};
  window.addEventListener("pagehide",persist);document.addEventListener("visibilitychange",hidden);
  return()=>{window.removeEventListener("pagehide",persist);document.removeEventListener("visibilitychange",hidden);};
 },[persist]);
 return {savedRun,ready,saveError};
}
