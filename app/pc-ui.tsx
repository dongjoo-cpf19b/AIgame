"use client";
import {useState} from "react";
import {ArrowLeft,ChevronRight,Monitor,MessageCircle,Phone,NotebookPen,BriefcaseBusiness,Trash2,Search,X,Network,Volume2,FolderOpen} from "lucide-react";
import {useDialog} from "./immersive-ui";

export function WindowsMark(){return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 4.5 11 3v8H2Zm10-1.7L22 1v10H12ZM2 12h9v8l-9-1.5Zm10 0h10v11l-10-1.8Z"/></svg>}
export function FileIcon({kind="folder"}:{kind?:"folder"|"hwp"|"pdf"}){
 return <span className={`pcFileIcon pcFile-${kind}`} aria-hidden="true">{kind==="folder"?<><i/><b/></>:<><i/>{kind==="hwp"?<b>한</b>:<b>PDF</b>}</>}</span>;
}
function EmptyBin({onClose}:{onClose:()=>void}){const ref=useDialog(onClose);return <div className="pcDialogBackdrop"><section ref={ref} className="pcMessage" role="dialog" aria-modal="true" aria-labelledby="bin-title"><header><b id="bin-title">휴지통</b><button onClick={onClose} aria-label="휴지통 닫기"><X size={18}/></button></header><Trash2 size={35}/><p>이 폴더는 비어 있습니다.</p><small>전임자가 정리는 깔끔하게 하고 갔다.</small><button className="primaryBtn" onClick={onClose}>확인</button></section></div>}
export function WindowsDesktop({onOpen,found}:{onOpen:(screen:string)=>void;found:number}){
 const [bin,setBin]=useState(false);
 const items=[{name:"내 PC",screen:"folders",icon:<Monitor/>},{name:"업무폴더",screen:"folders",icon:<FileIcon/>},{name:"문서등록대장",screen:"registry",icon:<span className="registryAppIcon">문</span>},{name:"단서함",screen:"clues",icon:<NotebookPen/>},{name:"팀장 보고",screen:"report",icon:<BriefcaseBusiness/>},{name:"휴지통",screen:"bin",icon:<Trash2/>}];
 return <div className="windowsDesktop winDesktop"><div className="winWallpaper" aria-hidden="true"><WindowsMark/></div><div className="winDesktopIcons">{items.map(item=><button key={item.name} className="winShortcut" onClick={()=>item.screen==="bin"?setBin(true):onOpen(item.screen)}><span className={`winShortcutIcon shortcut-${item.screen}`} aria-hidden="true">{item.icon}<i>↗</i></span><span>{item.name}</span></button>)}</div><div className="winStickyNote"><span>인수인계 메모</span><p>작년 자료는<br/>공용폴더에 있어요.</p><small>…인수인계 끝?</small><b>단서 {found} / 10</b></div><div className="winDesktopWatermark"><b>회계과 업무용 PC</b><span>행정업무망 · 신규 담당자</span></div>{bin&&<EmptyBin onClose={()=>setBin(false)}/>}</div>;
}
export function WindowsTaskbar({screen,disabled,found,onOpen,onContact}:{screen:string;disabled:boolean;found:number;onOpen:(screen:string)=>void;onContact:(kind:"msg"|"call")=>void}){
 const [start,setStart]=useState(false);
 const open=(next:string)=>{setStart(false);onOpen(next);};
 return <nav className="winTaskbar" aria-label="업무 PC 메뉴" onKeyDown={e=>{if(e.key==="Escape")setStart(false);}}>
  {start&&!disabled&&<div className="winStartMenu"><header><span className="pcUser">신</span><b>신규 담당자</b><small>회계과</small></header><span className="winMenuLabel">업무 바로가기</span>{[{name:"바탕 화면",to:"desktop",icon:<Monitor/>},{name:"업무폴더",to:"folders",icon:<FolderOpen/>},{name:"문서등록대장",to:"registry",icon:<Search/>},{name:"단서함",to:"clues",icon:<NotebookPen/>},{name:"팀장 보고",to:"report",icon:<BriefcaseBusiness/>}].map(x=><button key={x.to} onClick={()=>open(x.to)}>{x.icon}{x.name}</button>)}<footer>파일 이름보다 결재문서를 확인하세요.</footer></div>}
  <button className={`winStartButton ${start&&!disabled?"active":""}`} disabled={disabled} aria-label="시작 메뉴" aria-expanded={start&&!disabled} onClick={()=>setStart(v=>!v)}><WindowsMark/></button>
  <button disabled={disabled} className={screen==="desktop"?"active":""} onClick={()=>open("desktop")} aria-label="업무 PC 홈" title="바탕 화면"><Monitor/><span>바탕화면</span></button>
  <button disabled={disabled} onClick={()=>{setStart(false);onContact("msg");}} title="업무 메신저"><MessageCircle/><span>메신저</span><i className="winUnread"/></button>
  <button disabled={disabled} onClick={()=>{setStart(false);onContact("call");}} title="업무용 전화"><Phone/><span>전화</span></button>
  <button disabled={disabled} onClick={()=>open("clues")} title="단서함"><NotebookPen/><span>단서함</span></button>
  <div className="winTray"><div><Network size={11}/><Volume2 size={11}/></div><time><b>{disabled?"17:30":`09:${String(2+found*3).padStart(2,"0")}`}</b><span>2026-10-21</span></time></div>
 </nav>;
}

export type ExplorerItem={name:string;folder?:boolean;modified?:string;size?:string;onOpen:()=>void};
export function Explorer({path,onBack,items}:{path:string[];onBack:()=>void;items:ExplorerItem[]}){
 return <div className="explorerApp"><div className="explorerRibbon"><span>파일</span><span>홈</span><span>공유</span><span>보기</span></div><div className="explorerAddress"><button aria-label="상위 폴더" onClick={onBack}><ArrowLeft size={18}/></button><div><FileIcon/>{path.map((p,i)=><span key={p}>{i>0&&<ChevronRight size={12}/>} {p}</span>)}</div></div><div className="explorerLocation"><Network size={13}/> 청사관리 공용폴더 <span>읽기 전용</span></div><div className="explorerColumns"><span>이름</span><span>수정한 날짜 / 유형</span></div><div className="explorerItems">{items.map(item=><button className="explorerRow" key={item.name} onClick={item.onOpen}><FileIcon kind={item.folder?"folder":item.name.endsWith(".pdf")?"pdf":"hwp"}/><span><b>{item.name}</b><small>{item.modified||"2025-10-08 16:42"}<i>·</i>{item.folder?"파일 폴더":item.name.endsWith(".pdf")?"PDF 문서":"한글 문서"}{!item.folder&&<em>{item.size||"48 KB"}</em>}</small></span><ChevronRight size={14}/></button>)}</div><footer className="explorerStatus">{items.length}개 항목<span>누르면 열립니다</span></footer></div>;
}
