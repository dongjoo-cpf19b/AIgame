"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type IconName = "folder" | "document" | "clue" | "person" | "home" | "chat" | "phone";
export function GameIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    folder: <><path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v1"/><path d="M3 8h18l-2 12H4L2 10a2 2 0 0 1 1-2Z"/></>,
    document: <><path d="M6 2h8l5 5v15H6Z"/><path d="M14 2v6h5M9 12h7M9 16h7"/></>,
    clue: <><rect x="3" y="3" width="13" height="15" rx="2"/><circle cx="16" cy="16" r="5"/><path d="m20 20 3 3M6 7h7M6 10h5"/></>,
    person: <><circle cx="12" cy="7" r="4"/><path d="M3 22v-3a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v3M10 13l2 3 2-3m-2 3v6"/></>,
    home: <><path d="m2 11 10-8 10 8M5 9v12h14V9M9 21v-8h6v8"/></>,
    chat: <><path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-7a8 8 0 0 1-1-4 9 9 0 0 1 18 0Z"/><path d="M7 10h10M7 14h6"/></>,
    phone: <path d="m7 3 3 5-3 3a14 14 0 0 0 6 6l3-3 5 3-1 4C10 24 0 14 3 4Z"/>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function OfficialPaper({ screen, children, record }: { screen: string; children: ReactNode; record?:{number:string;date:string} }) {
  const canShowCover = screen === "plan" || screen === "result";
  const approved = canShowCover || !!record;
  const [showCover, setShowCover] = useState(false);
  const documentNumber = record?.number ?? (screen === "plan" ? "회계과-18421" : screen === "result" ? "회계과-21347" : "미등록");
  const documentDate = record?.date ?? (screen === "plan" ? "2025. 9. 22." : screen === "result" ? "2025. 10. 27." : "—");
  return <div className="documentViewer">
    <div className="documentTools"><span><GameIcon name="document"/> {approved ? documentNumber : "공용폴더 저장본"}</span>{canShowCover?<div className="documentTabs"><button aria-pressed={!showCover} onClick={()=>setShowCover(false)}>본문</button><button aria-pressed={showCover} onClick={()=>setShowCover(true)}>결재표지</button></div>:record&&<span>{documentDate} · 결재완료</span>}</div>
    <div className="paperShell"><article className={`paper officialPaper ${showCover?"coverSheet":"bodySheet"} ${screen==="reference"?"referenceSheet":""}`}>
      {showCover ? <>
        <div className="coverCity">성남시<span>시민의 오늘을 위한 행정</span></div>
        <div className="approvalGrid"><table className="registrationTable"><tbody><tr><th>생산등록번호</th><td>{documentNumber}</td></tr><tr><th>등 록 일</th><td>{documentDate}</td></tr><tr><th>결 재 일</th><td>{documentDate}</td></tr><tr><th>공개구분</th><td>공개</td></tr></tbody></table><table className="signoffTable"><tbody><tr><th rowSpan={2}>결<br/>재</th><th>주무관</th><th>팀장</th><th>과장</th><th>국장</th></tr><tr><td>검토</td><td>검토</td><td>검토</td><td>{documentDate}<br/>결재</td></tr><tr><th>협조</th><td colSpan={4}>각 부서 임무요원 · 소방관서</td></tr></tbody></table></div>
        <p className="coverSubtitle">- 화재 및 재난사고에 대한 초기대응태세 확립을 위한 -</p><h2>2025년 성남시청<br/>합동소방훈련·교육 {screen==="result"?"결과보고":"계획(안)"}</h2><div className="coverOrganization">성 남 시<strong>(회 계 과)</strong></div>
      </> : children}
      <footer className="documentFooter"><span>성남시 · 회계과</span><span>업무 체험용 재구성 문서</span></footer>
    </article></div>
  </div>;
}

export type ChatEntry = { id: number; text: string };
export function EvacuationPlan({ found, onCollect }: { found: boolean; onCollect: () => void }) {
  return <div className="evacuationViewer"><div className="evacuationHeading"><div><small>성남시청 · 소방안전관리</small><h2>피난동선도</h2></div><span>훈련용 개념도</span></div>
    <svg className="evacuationMap" viewBox="0 0 360 440" role="img" aria-labelledby="evacuation-title evacuation-description">
      <title id="evacuation-title">업무공간에서 외부 집결장소까지의 피난동선</title><desc id="evacuation-description">현 위치인 왼쪽 업무공간에서 중앙 복도로 나와, 오른쪽 피난계단을 지나 하단 비상구로 이동하면 외부 집결장소입니다. 실제 성남시청 층별 도면이 아닌 게임용 개념도입니다.</desc>
      <defs><pattern id="plan-grid" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M 12 0 L 0 0 0 12" fill="none" stroke="#e2eaf0" strokeWidth=".5"/></pattern><marker id="route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#21996f"/></marker></defs>
      <rect width="360" height="440" fill="#f8fafc"/><rect x="12" y="12" width="336" height="416" fill="url(#plan-grid)"/>
      <path d="M28 42H332V378H205M166 378H28Z" fill="#edf2f6" stroke="#647c8e" strokeWidth="4"/>
      <path d="M154 44H217V340H330V375H30V340H154Z" fill="#fff"/>
      <g fill="#e1edf6" stroke="#8ba4b7" strokeWidth="1.5"><path d="M30 44H154V96M154 136V164H30Z"/><path d="M30 164H154V203M154 236V264H30Z"/><path d="M30 264H154V301M154 326V339H30Z"/><path d="M218 44H330V143H218V121M218 85V44"/><path d="M218 143H330V258H218V222M218 185V143"/><path d="M218 258H330V339H218V320M218 282V258"/></g>
      <g fill="none" stroke="#a1b5c4" strokeWidth="1"><path d="M154 96a40 40 0 0 0-40 40h40M154 203a33 33 0 0 0-33 33h33M218 85a36 36 0 0 1 36 36h-36"/></g>
      <g className="planFurniture" fill="#f8fbfd" stroke="#aac0cf"><rect x="43" y="57" width="32" height="17"/><rect x="89" y="57" width="32" height="17"/><rect x="43" y="143" width="32" height="12"/><rect x="48" y="179" width="80" height="16"/><rect x="48" y="239" width="80" height="14"/><rect x="247" y="68" width="58" height="43" rx="9"/><rect x="240" y="157" width="22" height="20"/><rect x="290" y="157" width="22" height="20"/></g>
      <g fill="#4c667c" fontSize="12" textAnchor="middle" fontFamily="Malgun Gothic, sans-serif"><text x="86" y="91">직원 업무공간</text><text x="86" y="225">민원 업무공간</text><text x="86" y="295">자료실</text><text x="275" y="132">회의실</text><text x="275" y="218">지원 공간</text><text x="185" y="193" fontSize="11" fill="#8a9ca9">복도</text></g>
      <g stroke="#728b9b" strokeWidth="1.5"><path d="M248 270H315V324H248Z" fill="#e4f4ed"/><path d="M248 277H315M248 284H315M248 291H315M248 298H315M248 305H315M248 312H315M248 319H315"/></g>
      <path className="evacuationPath" d="M84 119H185V298H282V355H185V406" fill="none" stroke="#21996f" strokeWidth="5" strokeLinejoin="round" strokeDasharray="8 5" markerEnd="url(#route-arrow)"/>
      <path d="M122 119H144M185 239V262M199 298H220M213 355H193" fill="none" stroke="#21996f" strokeWidth="2" markerEnd="url(#route-arrow)"/>
      <circle cx="84" cy="119" r="10" fill="#3d7caf" stroke="#fff" strokeWidth="3"/><text x="84" y="136" textAnchor="middle" fontSize="9" fill="#315e83">현 위치</text>
      <rect x="246" y="329" width="72" height="20" rx="4" fill="#e0f2e9"/><text x="282" y="343" textAnchor="middle" fontSize="11" fill="#247454">피난계단</text>
      <rect x="158" y="364" width="54" height="19" rx="3" fill="#258460"/><text x="185" y="377" textAnchor="middle" fontSize="10" fill="#fff">비상구</text>
      <rect x="109" y="406" width="153" height="25" rx="5" fill="#deefe6" stroke="#a6cbb9"/><text x="185" y="423" textAnchor="middle" fontSize="12" fill="#237352">외부 대피 집결장소</text>
      <path d="M321 26V11m-4 6 4-6 4 6" stroke="#71899b" fill="none"/><text x="309" y="22" fontSize="9" fill="#71899b">N</text>
    </svg><div className="planLegend"><span><i className="locationDot"/>현 위치</span><span><i className="routeDash"/>대피 경로</span><span><i className="exitBox"/>비상구</span></div><p className="planInstruction">업무공간 → 복도 → 피난계단 → 비상구</p><button className="primaryBtn" onClick={onCollect}>{found ? "✓ 피난동선 확인 완료" : "피난동선·피난계단 확인"}</button></div>;
}
export function ContactDialog({ kind, text, history, onClose, onAccept }: {
  kind: "msg" | "call"; text: string; history: ChatEntry[]; onClose: () => void; onAccept: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.showModal();
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
    return () => { dialog?.close(); if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus(); };
  }, []);
  useEffect(() => {
    if (!connected) return;
    const timer = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [connected]);
  return <dialog ref={dialogRef} className={`contactDialog ${kind === "msg" ? "messengerDialog" : "callDialog"}`} aria-labelledby="contact-title" onCancel={onClose}>
    <div className="contactTop"><span>{kind === "msg" ? "직원 메신저" : "업무용 전화"}</span><button autoFocus type="button" onClick={onClose} aria-label="닫기">×</button></div>
    {kind === "msg" ? <>
      <div className="contactIdentity"><div className="contactAvatar"><GameIcon name="person"/></div><div><h2 id="contact-title">전임자 선배</h2><span><i/> 대화 가능</span></div></div>
      <div className="chatHistory" ref={messagesRef}><p className="chatDate">오늘 · 업무 인수인계</p>{history.map(entry=><div className="chatExchange" key={entry.id}><div className="chatMine">선배님, 자료 찾다가 막혔어요.<br/>어디를 더 확인하면 좋을까요?</div><small className="chatRead">읽음</small><div className="chatTheirs"><small>전임자 선배</small><p>{entry.text}</p></div></div>)}</div>
      <div className="chatComposer"><span>선배의 답변을 확인했어요.</span><button onClick={onClose}>업무로 돌아가기 ↗</button></div>
    </> : <>
      <p className="callState">{connected ? "통화 연결됨" : "전화가 왔습니다"}</p><div className={`callPortrait ${connected ? "connected" : ""}`}><GameIcon name="person"/></div>
      <h2 id="contact-title">전임자 선배</h2><p className="callSubtitle">{connected ? `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}` : "부재중이었죠? 지금 잠깐 통화돼요."}</p>
      {connected && <div className="callTranscript" role="status"><div className="voiceBars" aria-hidden="true"><i/><i/><i/><i/><i/></div><small>선배의 말</small><p>“{text}”</p></div>}
      <div className="callActions">{!connected && <button className="answerCall" onClick={()=>{setConnected(true);onAccept();}}><GameIcon name="phone"/><span>전화 받기</span></button>}<button className="endCall" onClick={onClose}><GameIcon name="phone"/><span>{connected ? "통화 종료" : "나중에 받기"}</span></button></div>
    </>}
  </dialog>;
}
