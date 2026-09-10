"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FirePlanBody } from "./report-documents";
import { SupportingFile } from "./supporting-files";
import { searchRegistry } from "./registry-data";
import { ContactDialog, EvacuationPlan, GameIcon, OfficialPaper, type ChatEntry } from "./game-ui";

type Screen =
  | "intro" | "desktop" | "folders" | "fire-folder" | "safety-folder" | "drawing-folder" | "drawing-sub"
  | "registry" | "draft" | "plan" | "result" | "fire-plan" | "route" | "clues" | "report" | "auto-call"
  | "boss" | "boss-reply" | "score" | "ending" | "final" | "raffle" | "file-preview";
type ClueId = "c1"|"c2"|"c3"|"c4"|"c5"|"c6"|"c7"|"c8"|"c9"|"c10";
type Clue = { title: string; value: string; line: string };

const SUPABASE_URL = "https://jkbselbyyfvupojlnbqk.supabase.co";
const SUPABASE_KEY = "sb_publishable_kZyp6c6w9PuZiUZuUuYeyQ_VnQutHYv";

const clues: Record<ClueId, Clue> = {
  c1:{title:"공용폴더 계획자료",value:"공용폴더 마지막 수정본: 2025. 10. 15.",line:"2025년 10월 15일… 일단 기억해두자."},
  c2:{title:"최종 결재 훈련일",value:"결재문서 계획(안): 2025. 10. 22.",line:"어? 공용폴더에는 10월 15일이었는데… 결재문서는 10월 22일이네."},
  c3:{title:"실제 실시일",value:"결과보고: 2025. 10. 22.",line:"결과보고도 10월 22일이네. 실제 훈련일은 확실하다."},
  c4:{title:"추진근거",value:"「공공기관의 소방안전관리에 관한 규정」 제14조",line:"아, 합동소방훈련은 이 규정에 근거해서 하는 거구나."},
  c5:{title:"협조기관",value:"분당소방서 야탑119안전센터",line:"작년에는 야탑119안전센터하고 같이 했네. 올해 협의할 때 참고해야겠다."},
  c6:{title:"훈련 진행순서",value:"상황전파 → 대피 → 초기진화 → 합동대응 → 교육·강평",line:"훈련 순서도 파악해두자. 올해 계획 짤 때 참고할 수 있겠네."},
  c7:{title:"예산·준비사항",value:"별도 사업예산 없음 / 현수막·방송·사진촬영·장비점검",line:"별도 사업예산은 없었네. 대신 준비할 건 꽤 있구나."},
  c8:{title:"피난계획",value:"성남시청 소방계획서 제3장 피난계획",line:"피난계획은 청사 소방계획서에 들어 있네."},
  c9:{title:"피난동선",value:"청사도면 소방 폴더의 피난동선도",line:"비상구하고 피난계단이 이렇게 연결되는구나. 실제 동선도 봐둬야겠다."},
  c10:{title:"실제 훈련내용",value:"상황전파·대피·초기소화·소방관서 합동대응",line:"계획만 세운 게 아니라 실제로 이 순서대로 훈련했네."},
};

const questions = [
  {q:"작년 합동소방훈련 언제 했어요?",a:["2025. 10. 15.","2025. 10. 22.","2025. 10. 29."],correct:1,ok:"네, 10월 22일이었죠. 계속해봐요.",bad:["10월 15일이요? 그거 최종 일정 맞아요?","","그 날짜는 아닌 것 같은데… 일단 계속해보죠."]},
  {q:"우리가 소방관서하고 합동훈련하는 근거가 뭐예요?",a:["재난 및 안전관리 기본법","산업안전보건법","「공공기관의 소방안전관리에 관한 규정」"],correct:2,ok:"맞아요. 공공기관 소방안전관리 규정에 근거해서 하는 거죠.",bad:["그 법이 이 훈련의 직접적인 근거였나요? 한번 더 확인해봐야겠는데.","그 법이 이 훈련의 직접적인 근거였나요? 한번 더 확인해봐야겠는데.",""]},
  {q:"작년에는 어디랑 같이 했어요?",a:["성남소방서","야탑119안전센터","판교119안전센터"],correct:1,ok:"네. 작년에는 야탑119안전센터하고 했어요.",bad:["거기였어요? 작년 협조기관 다시 확인해봐야 할 것 같은데.","","거기였어요? 작년 협조기관 다시 확인해봐야 할 것 같은데."]},
  {q:"훈련하면서 별도 예산이나 준비할 사항은 있었어요?",a:["별도 용역예산을 편성했습니다.","소방장비 임차비만 지출했습니다.","별도 사업예산은 없고 현수막·방송·사진촬영·장비점검 등을 준비했습니다."],correct:2,ok:"그렇죠. 별도 예산은 없었어도 준비할 건 꽤 있었죠.",bad:["별도 예산을 썼다고요? 계획서에 그렇게 되어 있었나요?","별도 예산을 썼다고요? 계획서에 그렇게 되어 있었나요?",""]},
  {q:"우리 시청 피난계획이나 피난동선도 확인했어요?",a:["합동소방훈련 계획안에서만 확인했습니다.","성남시청 소방계획서와 관련 도면에서 확인했습니다.","별도로 확인할 필요는 없습니다."],correct:1,ok:"그래요. 훈련계획만 볼 게 아니라 실제 피난동선도 같이 봐야죠.",bad:["훈련계획서만 봐서는 부족해요. 실제 대피할 때 어디로 가는지도 알아야죠.","","훈련계획서만 봐서는 부족해요. 실제 대피할 때 어디로 가는지도 알아야죠."]},
];

const decoys = [
  ["2025년_성남시청_합동소방훈련_계획.hwp","초안 같은데… 더 최근 파일이 있나 찾아보자."],
  ["2025년_성남시청_합동소방훈련_계획_수정.hwp","중간 수정본 같은데… 뒤에 더 최근 파일이 있네."],
  ["2025년_성남시청_합동소방훈련_계획_최종.hwp","최종…이라고 써 있긴 한데 아래에 파일이 더 있네."],
  ["2025년_성남시청_합동소방훈련_계획_최종(1).hwp","최종(1)… 벌써 느낌이 좀 불안한데."],
  ["2025년_성남시청_합동소방훈련_계획_최종(2).hwp","최종(2)… 이름만 보면 꽤 최종 같긴 한데."],
  ["2025년_성남시청_합동소방훈련_계획_최최종.hwp","최최종까지 왔네…"],
  ["2025년_성남시청_합동소방훈련_계획_최최종_수정.hwp","최최종인데 수정됐네. 역시 끝까지 봐야겠다."],
  ["★2025년_성남시청_합동소방훈련_계획_진짜최종.hwp","진짜최종… 이제 믿어도 되나? 근데 하나 더 있다."],
];

function uid(){ return crypto.randomUUID(); }
async function db(path:string,method:string,body:unknown){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{method,headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:body?JSON.stringify(body):undefined});
  if(!res.ok) throw new Error(await res.text());
}

export default function Page(){
  const [screen,setScreen]=useState<Screen>("intro");
  const [line,setLine]=useState("일단 작년 자료부터 찾아보자.");
  const [found,setFound]=useState<ClueId[]>([]);
  const [sessionId,setSessionId]=useState<string|null>(null);
  const [msgHints,setMsgHints]=useState(0);
  const [callHints,setCallHints]=useState(0);
  const [search,setSearch]=useState("");
  const [searched,setSearched]=useState(false);
  const [qIndex,setQIndex]=useState(0);
  const [score,setScore]=useState(0);
  const [reportedAt,setReportedAt]=useState(0);
  const [bossReply,setBossReply]=useState("");
  const [lastCorrect,setLastCorrect]=useState(false);
  const [raffleStatus,setRaffleStatus]=useState("");
  const [form,setForm]=useState({name:"",affiliation:"",phone:"",consent:false});
  const [contact,setContact]=useState<{kind:"msg"|"call";text:string}|null>(null);
  const [chatHistory,setChatHistory]=useState<ChatEntry[]>([]);
  const [latestClue,setLatestClue]=useState<ClueId|null>(null);
  const [preview,setPreview]=useState<{name:string;from:Screen;record?:{number:string;date:string}}|null>(null);
  useEffect(()=>{if(!latestClue)return;const timer=window.setTimeout(()=>setLatestClue(null),2800);return ()=>window.clearTimeout(timer);},[latestClue]);
  const grade=useMemo(()=>score===5?["S","청사관리 마스터"]:score===4?["A","믿고 맡길 주무관"]:score>=2?["B","인수인계 적응 완료"]:["C","이제 업무 시작"],[score]);

  function go(s:Screen,l?:string){setScreen(s);if(l)setLine(l);}
  function inspectFile(name:string,remark:string,record?:{number:string;date:string}){setPreview({name,from:screen,record});go("file-preview",remark);}
  function runSearch(query:string){setSearch(query);setSearched(true);setLine(searchRegistry(query).length?"여러 문서가 나오네. 제목과 연도를 잘 살펴보자.":"검색어를 조금 다르게 넣어봐야겠다.");}
  async function start(){const sid=uid();setSessionId(sid);try{await db("game_sessions","POST",{id:sid});}catch{}go("desktop","일단 작년 자료부터 찾아보자.");}
  function clue(cid:ClueId){if(found.includes(cid)){setLine("이 내용은 이미 확인했다.");return;}const next=[...found,cid];setFound(next);setLatestClue(cid);setLine(clues[cid].line);if(next.length===10)setTimeout(()=>go("auto-call","좋아. 이 정도면 물어보셔도 대답할 수 있겠다."),500);}
  function hint(kind:"msg"|"call"){
    const miss=(Object.keys(clues) as ClueId[]).find(c=>!found.includes(c));let t="그 정도면 충분히 파악한 것 같은데요? 팀장님께 가보세요.";
    if(miss==="c1")t="합동소방훈련 폴더의 마지막 수정본부터 한번 보세요.";else if(miss==="c2")t="공용폴더 보고 있어요? 최종 결재된 건 문등대에서 확인해봐요.";else if(miss==="c3"||miss==="c10")t="계획만 보지 말고 결과보고까지 한번 확인해보세요.";else if(["c4","c5","c6","c7"].includes(miss||""))t="결재된 계획안을 자세히 보면 근거, 협조기관, 준비사항까지 나와요.";else if(miss==="c8")t="청사 소방계획서 한번 봐봐요. 피난계획이 거기 있을 거예요.";else if(miss==="c9")t="준공도면 폴더에서 소방 관련 자료를 찾아보세요.";
    setContact({kind,text:t});
    if(kind==="msg"){setMsgHints(v=>v+1);setChatHistory(h=>[...h,{id:h.length+1,text:t}]);}
  }
  function beginBoss(){setReportedAt(found.length);setQIndex(0);setScore(0);go("boss","차근차근 대답해보자.");}
  function answer(i:number){const q=questions[qIndex];const ok=i===q.correct;setLastCorrect(ok);if(ok)setScore(v=>v+1);setBossReply(ok?q.ok:q.bad[i]);setLine(`“${q.a[i]}”라고 보고했다.`);setScreen("boss-reply");}
  function nextQuestion(){if(qIndex===questions.length-1){finish();return;}setQIndex(v=>v+1);setScreen("boss");setLine("다음 질문이다.");}
  async function finish(){const finalScore=score;setScore(finalScore);if(sessionId){try{await db(`game_sessions?id=eq.${sessionId}`,"PATCH",{completed_at:new Date().toISOString(),clues_collected:found.length,report_clues:reportedAt,correct_answers:finalScore,grade:finalScore===5?"S":finalScore===4?"A":finalScore>=2?"B":"C",messenger_hints:msgHints,phone_hints:callHints});}catch{}}setScreen("score");setLine("휴… 일단 첫 보고는 끝났다.");}
  async function raffle(e:FormEvent){e.preventDefault();const phone=form.phone.replace(/\D/g,"");if(!sessionId||!form.name.trim()||!form.affiliation.trim()||!/^010\d{8}$/.test(phone)||!form.consent){setRaffleStatus("성명·소속·휴대전화 11자리·동의 여부를 확인해주세요.");return;}try{await db("raffle_entries","POST",{id:uid(),session_id:sessionId,participant_name:form.name.trim(),affiliation:form.affiliation.trim(),phone_digits:phone});setRaffleStatus("응모가 완료되었습니다. 행운을 빕니다!");}catch(err){const t=String(err);setRaffleStatus(t.includes("duplicate")||t.includes("unique")?"이미 응모한 휴대전화 번호입니다.":"응모 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");}}

  const paper=(body:React.ReactNode)=><OfficialPaper screen={screen}>{body}</OfficialPaper>;
  const clueBtn=(cid:ClueId,children:React.ReactNode)=><button className={`clueTap ${found.includes(cid)?"got":""}`} onClick={()=>clue(cid)}>{children}</button>;

  function mainContent(){
    if(screen==="file-preview"&&preview)return <><Nav onBack={()=>go(preview.from)} title={preview.name}/><SupportingFile key={preview.name} name={preview.name} record={preview.record}/></>;
    if(screen==="desktop")return <div className="windowsDesktop"><div className="desktopGrid"><button onClick={()=>go("folders","합동소방훈련 자료면 여기 어딘가에 있겠지.")}><span className="appIcon folderIcon"><GameIcon name="folder"/></span><b>업무폴더</b></button><button onClick={()=>go("registry","그래도 결재된 문서는 한번 확인해봐야겠지.")}><span className="appIcon registryIcon"><GameIcon name="document"/></span><b>문서등록대장</b></button><button onClick={()=>go("clues","지금까지 파악한 내용을 한번 정리해보자.")}><span className="appIcon clueIcon"><GameIcon name="clue"/></span><b>단서함</b></button><button onClick={()=>go("report","핵심 내용은 어느 정도 파악한 것 같은데… 이대로 보고할까?")}><span className="appIcon reportIcon"><GameIcon name="person"/></span><b>보고하러 가기</b></button></div><aside className="deskMemo"><small>오늘의 업무</small><strong>작년 합동소방훈련<br/>내용 파악하기</strong><p>폴더에 남은 자료부터<br/>하나씩 확인해보자.</p><span>회계과 · 청사관리</span></aside><div className="desktopWatermark">성남시청 업무PC<small>작은 단서에서 시작되는 나의 첫 업무</small></div></div>;
    if(screen==="folders")return <><Nav onBack={()=>go("desktop")} title="📁 업무폴더"/><div className="stack"><button className="fileBtn" onClick={()=>go("fire-folder","……최종이 왜 이렇게 많아.")}>📁 01_합동소방훈련</button><button className="fileBtn" onClick={()=>go("safety-folder","소방훈련만 보면 끝인가… 청사 자체 소방계획도 한번 봐야겠다.")}>📁 02_소방안전관리</button><button className="fileBtn" onClick={()=>go("drawing-folder","계획서만 볼 게 아니라 실제 피난동선도 확인해봐야겠다.")}>📁 03_청사도면</button></div></>;
    if(screen==="fire-folder")return <><Nav onBack={()=>go("folders")} title="01_합동소방훈련"/><div className="stack">{decoys.map(([f,l])=><button key={f} className="fileBtn small" onClick={()=>inspectFile(f,l)}>📄 {f}</button>)}<button className="fileBtn small" onClick={()=>go("draft","그래도 이게 제일 마지막 파일 같긴 한데… 한번 보자.")}>📄 ★★2025년_성남시청_합동소방훈련_계획_진짜최종_과장님수정.hwp</button></div></>;
    if(screen==="safety-folder")return <><Nav onBack={()=>go("folders")} title="02_소방안전관리"/><div className="stack"><button className="fileBtn" onClick={()=>go("fire-plan","이건 청사 전체 소방안전관리 계획이구나. 피난 관련 내용도 있을 것 같은데.")}>📄 2025년_성남시청_소방계획서.hwp</button><button className="fileBtn" onClick={()=>inspectFile("소방안전관리자_업무현황.hwp","소방안전관리자 업무현황이네. 관련 자료긴 한데 지금 찾는 핵심 단서는 아닌 것 같다.")}>📄 소방안전관리자_업무현황.hwp</button><button className="fileBtn" onClick={()=>inspectFile("소방시설_점검결과.pdf","소방시설 점검자료네. 중요한 자료지만 지금은 합동소방훈련 내용을 파악하는 게 먼저다.")}>📄 소방시설_점검결과.pdf</button></div></>;
    if(screen==="drawing-folder")return <><Nav onBack={()=>go("folders")} title="03_청사도면"/><div className="stack"><button className="fileBtn" onClick={()=>inspectFile("건축","건축 준공도면이네. 합동소방훈련과 직접적인 관련은 없어 보여…")}>📁 건축</button><button className="fileBtn" onClick={()=>inspectFile("기계","냉난방이나 기계설비 자료 같은데… 지금 찾는 소방훈련 자료는 아닌 것 같다.")}>📁 기계</button><button className="fileBtn" onClick={()=>inspectFile("전기","전기설비 도면이네. 소방 쪽 자료를 따로 찾아보자.")}>📁 전기</button><button className="fileBtn" onClick={()=>go("drawing-sub","여기다. 소방 관련 도면이면 피난동선도 찾을 수 있겠는데?")}>📁 소방</button></div></>;
    if(screen==="drawing-sub")return <><Nav onBack={()=>go("drawing-folder")} title="03_청사도면 / 소방"/><div className="stack"><button className="fileBtn" onClick={()=>inspectFile("소방설비_준공도면.pdf","소방설비 전체 준공도면이네. 필요한 건 피난동선 쪽이다.")}>📄 소방설비_준공도면.pdf</button><button className="fileBtn" onClick={()=>inspectFile("층별_소방시설배치도.pdf","층별 소방시설 위치 자료네. 참고는 되지만 지금 찾는 건 피난동선이다.")}>📄 층별_소방시설배치도.pdf</button><button className="fileBtn" onClick={()=>go("route","도면까지 있네. 실제 대피 경로를 한번 확인해보자.")}>📄 피난동선도.pdf</button></div></>;
    if(screen==="registry")return <><Nav onBack={()=>go("desktop")} title="문서등록대장"/><form onSubmit={e=>{e.preventDefault();runSearch(search);}} className="searchBox"><label htmlFor="document-search">문서 제목 · 문서번호</label><input id="document-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="예: 합동소방, 훈련, 소방"/><button>검색</button></form><div className="searchSuggestions"><span>빠른 검색</span>{["합동소방","훈련","소방"].map(q=><button key={q} onClick={()=>runSearch(q)}>{q}</button>)}</div>{searched?<><div className="searchCount">검색 결과 <b>{searchRegistry(search).length}건</b><span>등록일 최신순</span></div><div className="stack">{searchRegistry(search).map(doc=><button className="docResult" data-document-id={doc.id} key={doc.id} onClick={()=>doc.target?go(doc.target,doc.remark):inspectFile(doc.title,doc.remark,{number:doc.number,date:doc.date})}><small>{doc.date} · 결재완료</small><b>{doc.title}</b><span>{doc.number}</span></button>)}{!searchRegistry(search).length&&<div className="empty">{search.trim()?"일치하는 문서가 없습니다. 다른 검색어를 입력해보세요.":"문서 제목이나 문서번호를 입력해주세요."}</div>}</div></>:<div className="registryEmpty"><GameIcon name="document"/><b>어떤 문서를 찾으시나요?</b><p>제목의 일부나 문서번호로 검색할 수 있습니다.</p></div>}</>;
    if(screen==="draft")return <><Nav onBack={()=>go("fire-folder")} title="★★…과장님수정.hwp"/>{paper(<><h2>2025년 성남시청 합동소방훈련·교육 계획(안)</h2><h3>1. 개요</h3><p>□ 화재 및 재난사고에 대한 초기대응태세 확립</p><h3>2. 추진근거</h3><p>□ 「공공기관의 소방안전관리에 관한 규정」 제14조</p><h3>3. 훈련개요</h3><p>□ 일 시: {clueBtn("c1","2025. 10. 15.(수) 14:00~15:30")}</p><p>□ 장 소: 성남시청 및 야외 집결장소</p><small>※ 공용폴더 저장본으로 결재정보는 표시되어 있지 않습니다.</small></>)}</>;
    if(screen==="plan")return <><Nav onBack={()=>go("registry")} title="회계과-18421 · 결재완료"/>{paper(<FirePlanBody clue={clueBtn}/>)}</>;
    if(screen==="result")return <><Nav onBack={()=>go("registry")} title="회계과-21347 · 결재완료"/>{paper(<><h2>2025년 성남시청 합동소방훈련·교육 결과보고</h2><h3>1. 훈련개요</h3><p>□ 일 시: {clueBtn("c3","2025. 10. 22.(수) 14:00~15:30")}</p><p>□ 장 소: 성남시청</p><p>□ 협조기관: 야탑119안전센터</p><h3>2. 주요 훈련내용</h3><p>{clueBtn("c10","상황전파 · 직원/민원인 대피 · 자위소방대 초기소화 · 소방관서 합동대응 · 소방교육")}</p><h3>3. 훈련결과</h3><p>□ 계획된 절차에 따라 합동소방훈련·교육 실시 완료</p></>)}</>;
    if(screen==="fire-plan")return <><Nav onBack={()=>go("safety-folder")} title="2025년_성남시청_소방계획서.hwp"/>{paper(<><h2>2025년 성남시청 소방계획서</h2><h3>목 차</h3><p>제1장 일반사항</p><p>제2장 예방 및 완화</p><p>{clueBtn("c8","제3장 피난계획")}</p><p>제4장 대응계획</p><p>제5장 소방훈련 및 교육</p><hr/><h3>제3장 피난계획</h3><p>□ 화재 발생 시 피난경로</p><p>□ 피난계단 및 피난구</p><p>□ 외부 대피 집결장소</p></>)}</>;
    if(screen==="route")return <><Nav onBack={()=>go("drawing-sub")} title="피난동선도.pdf"/><EvacuationPlan found={found.includes("c9")} onCollect={()=>clue("c9")}/></>;
    if(screen==="clues")return <><Nav onBack={()=>go("desktop")} title="🧩 단서함"/><div className="stack">{found.length?found.map((c,i)=><div className="clueCard" key={c}><small>단서 {i+1}</small><b>{clues[c].title}</b><span>{clues[c].value}</span></div>):<div className="empty">아직 확보한 단서가 없습니다.</div>}</div></>;
    if(screen==="report")return <><Nav onBack={()=>go("desktop")} title="팀장 보고"/><div className="confirm"><h2>지금 보고하시겠습니까?</h2><p>현재 확보한 단서 <b>{found.length} / 10</b></p><small>보고를 시작하면 자료를 다시 확인할 수 없습니다.</small><button onClick={()=>go("desktop")}>조금 더 확인한다</button><button className="primaryBtn" onClick={beginBoss}>이 정도면 됐다. 보고하러 가자</button></div></>;
    if(screen==="auto-call")return <div className="confirm"><small>🧩 단서 10 / 10</small><h1>띠링 ♪</h1><div className="message"><b>💬 팀장님</b><p>“○○주무관, 작년 소방훈련 내용 파악됐어요? 잠깐 와봐요.”</p></div><button className="primaryBtn" onClick={beginBoss}>팀장님께 가기</button></div>;
    if(screen==="boss")return <div className="bossScene"><div className="reportProgress"><span>팀장 보고</span><b>{qIndex+1} / 5</b></div><div className="bossIdentity"><span><GameIcon name="person"/></span><div><small>회계과 · 청사관리</small><b>팀장님</b></div></div><div className="bossBubble"><p>“{questions[qIndex].q}”</p></div><div className="stack">{questions[qIndex].a.map((a,i)=><button className="choice" key={a} onClick={()=>answer(i)}><span className="answerNumber">{i+1}</span>{a}</button>)}</div></div>;
    if(screen==="boss-reply")return <div className="bossScene"><div className="reportProgress"><span>팀장 보고</span><b>{qIndex+1} / 5</b></div><div className="bossIdentity"><span><GameIcon name="person"/></span><div><small>회계과 · 청사관리</small><b>팀장님</b></div></div><div className={`bossBubble ${lastCorrect?"positive":"thoughtful"}`}><p>“{bossReply}”</p></div><button className="primaryBtn" onClick={nextQuestion}>{qIndex===4?"보고 마치기":"다음 질문"} →</button></div>;
    if(screen==="score")return <div className="score"><small>🏆 인수인계 평가</small><h1>{grade[0]}</h1><h2>{grade[1]}</h2><div className="summary"><p><span>정답</span><b>{score} / 5</b></p><p><span>보고 시 확보 단서</span><b>{reportedAt} / 10</b></p><p><span>메신저</span><b>{msgHints}회</b></p><p><span>전화</span><b>{callHints}회</b></p></div><button className="primaryBtn" onClick={()=>go("ending","설마… 벌써 올해 훈련 얘기인가?")}>업무 계속하기</button></div>;
    if(screen==="ending")return <div className="call"><div className="phone">📞</div><small>전화가 옵니다.</small><h2>야탑119안전센터</h2><div className="message"><p>“회계과 담당자님 맞으시죠? 올해 합동소방훈련 일정 협의드리려고 전화드렸습니다.”</p></div><button className="primaryBtn" onClick={()=>go("final","…그래. 이제 내가 담당자구나.")}>전화 받기</button></div>;
    if(screen==="final")return <div className="score"><div className="phone">🔥</div><h1 className="finalTitle">이제 진짜 담당자입니다.</h1><p>업무 파악 완료</p><button className="primaryBtn" onClick={()=>go("raffle","업무도 했는데 기프티콘 정도는 노려봐도 되겠지.")}>🎁 경품 추첨 참여하기</button></div>;
    if(screen==="raffle")return <><h2>추첨 참여</h2><form className="raffle" onSubmit={raffle}><input placeholder="성명" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input placeholder="소속" value={form.affiliation} onChange={e=>setForm({...form,affiliation:e.target.value})}/><input placeholder="010-1234-5678" inputMode="numeric" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><label><input type="checkbox" checked={form.consent} onChange={e=>setForm({...form,consent:e.target.checked})}/> 경품 추첨 및 기프티콘 발송을 위한 개인정보 수집·이용에 동의합니다.</label><button className="primaryBtn">응모하기</button>{raffleStatus&&<div className="status">{raffleStatus}</div>}</form></>;
    return null;
  }

  if(screen==="intro")return (
    <main className="page">
      <section className="intro" aria-labelledby="intro-title">
        <h1 id="intro-title" className="introAccessibleCopy">인수인계의 전설</h1>
        <p className="introAccessibleCopy">성남시청 신규 담당자 업무 시뮬레이션. 전임자는 떠났습니다. 인수인계서는 없습니다. 그래도 오늘의 업무는 시작됩니다.</p>
        <div className="introArtwork" role="img" aria-label="햇살이 비치는 성남시청 사무실, 첫 업무를 앞둔 신규 담당자">
          <span className="introTears" aria-hidden="true"><i /><i /></span>
          <span className="introMotes" aria-hidden="true"><i /><i /><i /></span>
        </div>
        <div className="introWelcome">
          <div className="introGuideHeading">
            <h2>첫 업무, 이렇게 시작하세요</h2>
            <span>약 5분</span>
          </div>
          <ol className="introSteps" aria-label="플레이 방법">
            <li><span aria-hidden="true">01</span><strong>자료 찾기</strong><p>업무폴더와<br/>문등대 살펴보기</p></li>
            <li><span aria-hidden="true">02</span><strong>단서 모으기</strong><p>문서 속 음영<br/>표시 눌러보기</p></li>
            <li><span aria-hidden="true">03</span><strong>팀장 보고</strong><p>찾아낸 단서로<br/>질문에 답하기</p></li>
          </ol>
          <button className="introStart" onClick={start}>업무 시작하기<span aria-hidden="true">→</span></button>
          <p className="introFootnote">작은 단서들이 모여, 진짜 담당자가 됩니다.</p>
        </div>
      </section>
    </main>
  );

  const reportPhase=["boss","boss-reply","score","ending","final","raffle"].includes(screen);
  const folderPhase=["folders","fire-folder","safety-folder","drawing-folder","drawing-sub"].includes(screen);
  const windowTitle=screen==="desktop"?"바탕화면":folderPhase?"파일 탐색기":screen==="registry"?"문서등록대장":reportPhase?"팀장 보고":"업무 자료";
  return <main className="page playPage"><section className={`gameShell cinematicGame ${reportPhase?"sunsetPhase":"dayPhase"}`}>
    <Image className="officeBackdrop" src="/art/office-cinematic-v2.png" alt="" fill sizes="460px" quality={75}/>
    <header className="sceneHeader"><div><small>인수인계의 전설 · 첫 번째 업무</small><b>성남시청 <span>회계과</span></b></div><div className="clueMeter"><span>확보한 단서 <b>{found.length}<small> / 10</small></b></span><progress value={found.length} max={10} aria-label="확보한 단서"/></div></header>
    <div className="sceneCaption"><span>{reportPhase?"어느덧, 보고할 시간":"햇살이 스며드는 사무실"}</span><small>{reportPhase?"알아낸 내용을 차근차근 전해보자.":"전임자의 흔적을 따라, 나의 첫 업무가 시작된다."}</small></div>
    <div className="office"><div className="monitor"><div className="monitorBar"><span className="monitorBrand"><i/> SEONGNAM</span><span>회계과 · 업무용 PC</span></div><div className={`monitorScreen screen-${screen}`} key={screen}><div className="appTitlebar"><span><GameIcon name={folderPhase?"folder":"document"}/>{windowTitle}</span><span aria-hidden="true">— &nbsp; □</span></div><div className="screenBody">{mainContent()}</div></div><nav aria-label="업무PC 작업표시줄"><button aria-label="홈" disabled={reportPhase} onClick={()=>go("desktop","일단 작년 자료부터 찾아보자.")}><span className="windowsMark" aria-hidden="true"><i/><i/><i/><i/></span><span>홈</span></button><button onClick={()=>hint("msg")} disabled={reportPhase}><GameIcon name="chat"/><span>메신저</span></button><button onClick={()=>hint("call")} disabled={reportPhase}><GameIcon name="phone"/><span>전화</span></button><div className="trayStatus"><i/>업무 중</div></nav></div><div className="stand"/><div className="base"/></div>
    <div className="storyDialogue" aria-live="polite"><div className="dialoguePortrait" aria-hidden="true"/><div className="dialogueCopy"><div className="dialogueName"><b>나</b><i aria-hidden="true">✦</i></div><p key={line}>{line}</p></div></div>
    {latestClue&&<div className="clueToast" key={latestClue} role="status"><span><GameIcon name="clue"/></span><div><small>새로운 단서 발견 · {found.length} / 10</small><b>{clues[latestClue].title}</b></div><strong>+1</strong></div>}
    {contact&&<ContactDialog kind={contact.kind} text={contact.text} history={chatHistory} onClose={()=>setContact(null)} onAccept={()=>setCallHints(v=>v+1)}/>}
  </section></main>;
}

function Nav({onBack,title}:{onBack:()=>void;title:string}){return <div className="navHead"><button onClick={onBack} aria-label="이전 화면">←</button><b>{title}</b></div>}
