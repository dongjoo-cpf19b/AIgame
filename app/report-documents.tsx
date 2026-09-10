import type { ReactNode } from "react";

type PlanClue = "c2" | "c4" | "c5" | "c6" | "c7";
export function FirePlanBody({ clue }: { clue: (id: PlanClue, text: ReactNode) => ReactNode }) {
  return <>
    <h2>2025년 성남시청<br/>합동소방훈련·교육 계획(안)</h2>
    <h3>1. 개요</h3>
    <p>□ 성남시청 내 화재 등 재난사고 발생 시 신속한 인명 대피 및 초기 대응을 위해 소방관서와 합동소방훈련을 실시하여, 청사 내 인명과 재산을 보호하고자 함.</p>
    <h3>2. 추진근거</h3>
    <p>□ {clue("c4", "「공공기관의 소방안전관리에 관한 규정」 제14조")}</p>
    <p className="reportIndent">○ 소방관서와의 협조체계를 확인하고, 자위소방대 임무 및 청사 대피절차를 숙달하고자 함.</p>
    <h3>3. 훈련개요</h3>
    <p>□ 일　시: {clue("c2", "2025. 10. 22.(수) 14:00~15:30")}</p>
    <p>□ 장　소: 성남시청 청사 및 외부 대피 집결장소</p>
    <p>□ 참여자: 성남시청 직원 및 청사 내 민원인</p>
    <p>□ 협조기관: {clue("c5", "분당소방서 야탑119안전센터")}</p>
    <p>□ 훈련내용</p>
    <p className="reportIndent">○ 화재발생에 따른 신고 및 상황전파<br/>○ 직원·민원인 대피 및 자위소방대 초기소화<br/>○ 소방관서 합동대응 및 소방안전교육</p>
    <div className="reportFlow" aria-label="기관별 훈련 역할"><div><b>성남시청</b><span>상황전파<br/>대피·초기소화</span></div><i>⇨</i><div><b>소방관서</b><span>합동대응<br/>훈련 지원</span></div><i>⇨</i><div><b>교육·강평</b><span>사용법 교육<br/>훈련 총평</span></div></div>
    <div className="reportPageBreak"><span>— 1 —</span></div>
    <h3>4. 세부 추진계획</h3>
    <p>□ 훈련진행</p>
    <p>{clue("c6", "상황전파 → 대피 → 초기진화 → 합동대응 → 교육·강평")}</p>
    <p className="reportIndent">○ 상황전파: 가상 화재상황 전파, 신고 및 안내방송<br/>○ 인명대피: 층별 대피유도요원 안내에 따라 이동<br/>○ 초기진화: 자위소방대 임무에 따른 초기 대응<br/>○ 합동대응: 소방관서 도착 후 현장 안내 및 협조<br/>○ 교육·강평: 소방장비 사용법 교육 및 훈련 총평</p>
    <p>□ 시간계획</p>
    <table className="scheduleTable"><caption>합동소방훈련·교육 시간계획</caption><thead><tr><th>구 분</th><th>시 간</th><th>내 용</th><th>주 관</th></tr></thead><tbody>
      <tr><td>훈련 안내</td><td>14:00<br/>~14:05</td><td>○ 훈련목적 및 진행절차 안내<br/>○ 임무요원 배치 확인</td><td>회계과</td></tr>
      <tr><td>상황전파</td><td>14:05<br/>~14:10</td><td>○ 가상 화재 신고<br/>○ 안내방송 및 상황전파</td><td>회계과<br/>임무요원</td></tr>
      <tr><td>인명대피</td><td>14:10<br/>~14:20</td><td>○ 직원·민원인 대피 유도<br/>○ 외부 집결 및 인원 확인</td><td>각 부서<br/>임무요원</td></tr>
      <tr><td>초기진화</td><td>14:20<br/>~14:30</td><td>○ 자위소방대 초기소화<br/>○ 현장 통제 및 진입로 확보</td><td>자위소방대</td></tr>
      <tr><td>합동대응</td><td>14:30<br/>~14:50</td><td>○ 소방관서 합동대응<br/>○ 현장상황 인계 및 협조</td><td>야탑119<br/>안전센터</td></tr>
      <tr><td>교육·강평</td><td>14:50<br/>~15:30</td><td>○ 소방장비 사용법 교육<br/>○ 훈련 총평 및 현장 정리</td><td>소방관서<br/>회계과</td></tr>
    </tbody></table>
    <div className="reportPageBreak"><span>— 2 —</span></div>
    <p>□ 분야별 임무</p>
    <table className="dutyTable"><thead><tr><th>구 분</th><th>담 당</th><th>주요 임무</th></tr></thead><tbody><tr><td>훈련 총괄</td><td>회계과</td><td>계획 수립, 기관 협의 및 진행상황 확인</td></tr><tr><td>대피 유도</td><td>각 부서 임무요원</td><td>층별 대피 안내 및 집결 인원 확인</td></tr><tr><td>초기 대응</td><td>자위소방대</td><td>임무별 초기 대응 및 현장 협조</td></tr><tr><td>합동 대응</td><td>야탑119안전센터</td><td>소방관서 합동훈련 및 교육 지원</td></tr></tbody></table>
    <h3>5. 행정사항</h3>
    <p>□ {clue("c7", "별도 사업예산 없음 / 현수막·방송·사진촬영·장비점검")}</p>
    <p>□ 훈련 안내 및 협조사항 사전 공유(각 부서)</p>
    <p>□ 청사 소방계획서 및 피난동선도 확인</p>
    <p>□ 훈련 실시 결과와 현장 기록 정리</p>
    <p className="reportEnd">붙임　합동소방훈련·교육 진행 시나리오 1부.　끝.</p>
  </>;
}
