"use client";

import { useState } from "react";
import { GameIcon, OfficialPaper } from "./game-ui";

const drawingFolders: Record<string, string[]> = {
  "건축": ["청사_건축_평면도.pdf", "청사_공간배치_검토도.pdf"],
  "기계": ["냉난방_설비계통도.pdf", "기계실_장비배치도.pdf"],
  "전기": ["전기_간선계통도.pdf", "분전반_배치도.pdf"],
};

function TechnicalDrawing({ name }: { name: string }) {
  const electric = /전기|분전반/.test(name);
  const mechanical = /냉난방|기계/.test(name);
  const fire = /소방/.test(name);
  const labels = electric ? ["분전반 A", "분전반 B", "전기실", "간선 구간"] : mechanical ? ["공조 구역 A", "공조 구역 B", "기계실", "설비 배관"] : fire ? ["감지 구역 A", "감지 구역 B", "수신반", "소방시설"] : ["업무공간", "회의실", "자료실", "지원공간"];
  return <div className="technicalSheet"><div className="technicalHeading"><GameIcon name="document"/><b>{name.replace('.pdf','').replaceAll('_',' ')}</b></div>
    <svg viewBox="0 0 320 330" role="img" aria-label={`${labels.join(', ')}을 표시한 게임용 참고 개념도`}>
      <defs><pattern id={`tech-grid-${electric?'e':mechanical?'m':fire?'f':'a'}`} width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#dce6ed" strokeWidth=".5"/></pattern></defs>
      <rect width="320" height="330" fill={`url(#tech-grid-${electric?'e':mechanical?'m':fire?'f':'a'})`}/><path d="M20 30H300V292H20Z" fill="#eef4f8" stroke="#516e83" strokeWidth="3"/>
      <path d="M20 142H300M140 30V142M180 142V292M20 176H180" stroke="#617f94" strokeWidth="2" fill="none"/>
      <g fill="#466379" fontSize="12" textAnchor="middle"><text x="78" y="89">{labels[0]}</text><text x="220" y="89">{labels[1]}</text><text x="98" y="237">{labels[2]}</text><text x="239" y="220">{labels[3]}</text><text x="100" y="164" fontSize="10">중앙 통로</text></g>
      <path d={electric?'M45 260V117H256V235':mechanical?'M60 60H270V263H70V200':fire?'M50 60H272V258H53V60':'M22 308H298'} stroke={electric?'#c59433':mechanical?'#428daa':fire?'#bf6b67':'#66869b'} strokeWidth="3" fill="none" strokeDasharray={electric?'4 3':undefined}/>
      {[55,145,265].map((x,i)=><g key={x}><rect x={x-6} y={i===1?252:109} width="12" height="12" fill={electric?'#e9cc7f':fire?'#e4a29b':'#9fc6db'} stroke="#56758c"/><text x={x} y={i===1?280:135} textAnchor="middle" fontSize="8" fill="#688597">{electric?'E':mechanical?'M':fire?'F':'A'}-{i+1}</text></g>)}
    </svg><table><tbody><tr><th>시설명</th><td>성남시청</td><th>도면구분</th><td>{electric?'전기':mechanical?'기계':fire?'소방':'건축'}</td></tr><tr><th>축척</th><td>축척 없음</td><th>비고</th><td>참고 개념도</td></tr></tbody></table><p className="technicalNote">게임용 재구성 도면 · 실제 시공·대피 안내용 도면이 아닙니다.</p></div>;
}

export function SupportingFile({ name, record }: { name: string; record?:{number:string;date:string} }) {
  const [selected, setSelected] = useState<string|null>(null);
  if (drawingFolders[name]) return <div>{selected ? <><button className="folderReturn" onClick={()=>setSelected(null)}>← {name} 폴더</button><SupportingFile key={selected} name={selected}/></> : <><div className="folderBreadcrumb">업무폴더 / 청사도면 / {name}</div><div className="stack">{drawingFolders[name].map(file=><button className="fileBtn" key={file} onClick={()=>setSelected(file)}>📄 {file}</button>)}</div></>}</div>;
  if (/도면|계통도|배치도|평면도|검토도/.test(name)) return <TechnicalDrawing name={name}/>;
  const title = name.replace(/\.(hwp|pdf)$/,'').replaceAll('_',' ').replaceAll('★','').trim();
  const draft = /합동소방훈련/.test(name);
  const inspection = /점검결과/.test(name);
  const management = /업무현황/.test(name);
  const civilDefense = /민방위/.test(name);
  const oldResult=/2024.*결과보고/.test(name);
  const coordination=/사전협의/.test(name);
  const notice=/참여 안내/.test(name);
  const stage = name.includes('진짜최종')?'관계부서 의견 반영':name.includes('최최종')?'훈련 구성 재검토':name.includes('최종')?'보고 전 검토':name.includes('수정')?'실무 의견 반영':'최초 작성';
  return <OfficialPaper screen="reference" record={record}><h2>{title}</h2>
    {oldResult ? <><h3>1. 훈련결과</h3><p>□ 대상연도: 2024년</p><p>□ 청사 합동소방훈련 실시 결과 및 개선사항 정리</p><h3>2. 주요 내용</h3><p>□ 부서별 훈련 참여와 현장 운영 기록 취합</p><p>□ 차기 훈련 계획 수립 시 개선사항 검토</p><small>※ 본 문서는 2024년도 실적 자료입니다.</small></> : coordination ? <><h3>1. 협의개요</h3><p>□ 2025년 청사 합동소방훈련 추진을 위한 사전 검토</p><h3>2. 협의사항</h3><p>□ 참여 범위와 훈련 장소 검토</p><p>□ 관계기관 일정 및 현장 운영 여건 협의</p><p>□ 부서별 협조사항 수렴</p><h3>3. 향후계획</h3><p>□ 협의 결과를 반영하여 정식 계획안 결재 추진</p></> : notice ? <><h3>1. 안내사항</h3><p>□ 청사 합동소방훈련에 따른 직원 참여 및 부서별 협조 요청</p><h3>2. 협조사항</h3><p>□ 각 부서에서는 훈련 내용을 직원에게 안내</p><p>□ 임무요원은 본인 역할과 집결 안내사항 확인</p><h3>3. 참고자료</h3><p>□ 세부 일정 및 추진내용은 결재된 합동소방훈련·교육 계획(안) 참조</p></> : draft ? <><h3>1. 추진방향</h3><p>□ 청사 화재상황을 가정하여 직원·민원인 대피 및 초기 대응체계를 점검하고자 함.</p><h3>2. 작성 현황</h3><table><tbody><tr><th>자료구분</th><td>내부 검토자료</td></tr><tr><th>검토단계</th><td>{stage}</td></tr><tr><th>결재정보</th><td>공용폴더에는 포함되어 있지 않음</td></tr></tbody></table><h3>3. 검토사항</h3><p>□ 훈련 일정과 참여 범위 협의</p><p>□ 부서별 대피유도요원 배치 검토</p><p>□ 현장 안내 및 훈련 준비물 정리</p><p>□ {stage === '최초 작성' ? '훈련 초안 작성 후 관계부서 의견 수렴 예정' : stage === '실무 의견 반영' ? '진행순서 및 현장 안내 문구 수정' : stage === '보고 전 검토' ? '부서별 임무와 준비사항 확인 요청' : stage === '훈련 구성 재검토' ? '교육·강평 구성 및 훈련 안내 문구 재정리' : '관계부서 검토 의견 반영 후 최종 보고 예정'}</p><h3>4. 후속조치</h3><p>□ 검토의견을 반영하여 계획안을 보완하고 결재 상신</p><small>※ 파일명은 작성자가 정리한 명칭이며, 결재문서의 시행 여부와 일치하지 않을 수 있습니다.</small></> : inspection ? <><h3>1. 점검개요</h3><p>□ 대상: 성남시청 청사 내 소방시설</p><p>□ 내용: 소화설비·경보설비 등의 관리상태 확인</p><h3>2. 항목별 확인사항</h3><table><thead><tr><th>구 분</th><th>점검 항목</th><th>관리 사항</th></tr></thead><tbody><tr><td>소화설비</td><td>소화기 배치·표시 상태</td><td>대장 관리</td></tr><tr><td>경보설비</td><td>수신반 및 경보장치</td><td>기록 확인</td></tr><tr><td>피난시설</td><td>유도등·출입구 주변</td><td>정기 확인</td></tr></tbody></table><h3>3. 조치사항</h3><p>□ 점검대장에 확인내용을 기록하고 후속조치 필요사항을 관리함.</p><p>□ 관련 점검서류는 소방안전관리 자료철에 편철함.</p></> : management ? <><h3>1. 업무개요</h3><p>□ 청사 소방안전관리 업무의 지속적인 수행과 관련 기록의 체계적 관리</p><h3>2. 주요 업무</h3><table><thead><tr><th>구 분</th><th>업무 내용</th></tr></thead><tbody><tr><td>계획 관리</td><td>소방안전관리 관련 계획 및 기록 관리</td></tr><tr><td>시설 관리</td><td>소방시설 점검자료 확인 및 조치사항 정리</td></tr><tr><td>교육 관리</td><td>교육·훈련 실적 및 참석자료 정리</td></tr></tbody></table><h3>3. 자료관리</h3><p>□ 문서등록대장과 소방안전관리 자료철을 통해 관련 자료를 확인함.</p></> : civilDefense ? <><h3>1. 추진목적</h3><p>□ 민방위 비상소집훈련을 통한 응소체계 확인</p><h3>2. 훈련대상</h3><p>□ 비상소집 대상 민방위대원</p><h3>3. 운영사항</h3><p>□ 대상자 안내 및 참석 확인</p><p>□ 비상연락망 점검 및 교육자료 배부</p><h3>4. 행정사항</h3><p>□ 훈련 참석 결과 정리 및 관련 서류 제출</p></> : <><h3>1. 교육개요</h3><p>□ 신규공무원 재난대응 역량 강화를 위한 교육 참석자 현황 제출</p><h3>2. 제출사항</h3><table><thead><tr><th>항 목</th><th>작성 내용</th></tr></thead><tbody><tr><td>소속</td><td>교육 참석자 소속 부서</td></tr><tr><td>참석구분</td><td>신규공무원 교육 대상 여부</td></tr><tr><td>참석일정</td><td>별도 교육 일정표 확인</td></tr></tbody></table><h3>3. 협조사항</h3><p>□ 각 부서에서는 교육 대상자를 확인하여 참석자료를 제출하여 주시기 바랍니다.</p></>}
  </OfficialPaper>;
}
