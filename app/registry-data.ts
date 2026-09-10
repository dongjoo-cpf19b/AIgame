export type RegistryDocument = {
  id: string; title: string; date: string; number: string;
  target?: "plan" | "result"; remark: string;
};

export const registryDocuments: RegistryDocument[] = [
  {id:"result",title:"2025년 성남시청 합동소방훈련·교육 결과보고",date:"2025. 10. 27.",number:"회계과-21347",target:"result",remark:"계획대로 실제로 했는지도 봐야지."},
  {id:"equipment",title:"2025년 소방장비 점검결과 보고",date:"2025. 10. 20.",number:"회계과-20718",remark:"장비 점검 기록이네. 훈련 실시 결과와는 다른 자료다."},
  {id:"notice",title:"2025년 성남시청 합동소방훈련 참여 안내",date:"2025. 10. 17.",number:"회계과-20506",remark:"직원들에게 보낸 안내 문서구나. 자세한 내용은 계획안도 봐야겠다."},
  {id:"plan",title:"2025년 성남시청 합동소방훈련·교육 계획(안)",date:"2025. 9. 22.",number:"회계과-18421",target:"plan",remark:"9월 22일에 결재된 문서네. 이게 공식적으로 남은 계획안이겠다."},
  {id:"coordination",title:"2025년 합동소방훈련 사전협의 사항 보고",date:"2025. 9. 12.",number:"회계과-17630",remark:"훈련 전에 검토한 협의사항이네. 확정된 계획과는 구분해야겠다."},
  {id:"inspection",title:"2025년 청사 소방시설 점검결과 보고",date:"2025. 9. 5.",number:"회계과-17014",remark:"소방시설 점검자료네. 지금 찾는 건 합동훈련 자료다."},
  {id:"civil-defense",title:"2025년 민방위 비상소집훈련 계획",date:"2025. 8. 18.",number:"재난안전관-12035",remark:"민방위 훈련 계획이네. 합동소방훈련과는 다른 훈련이다."},
  {id:"education",title:"신규공무원 재난대응 교육훈련 참석자 제출",date:"2025. 6. 10.",number:"행정지원과-9817",remark:"신규공무원 교육훈련 자료네. 찾는 자료와는 주제가 다르다."},
  {id:"manager",title:"2025년 소방안전관리자 업무현황 보고",date:"2025. 3. 4.",number:"회계과-4126",remark:"소방안전관리 업무를 정리한 문서다. 개별 훈련 내용은 따로 봐야겠다."},
  {id:"old-result",title:"2024년 성남시청 합동소방훈련 결과보고",date:"2024. 11. 1.",number:"회계과-22081",remark:"한 해 전 자료구나. 지금 파악해야 하는 건 2025년 훈련이다."},
];

export function searchRegistry(query: string) {
  const normalized=query.replace(/\s+/g,"").toLowerCase();
  if (!normalized) return [];
  return registryDocuments.filter(doc=>(doc.title+doc.number).replace(/\s+/g,"").toLowerCase().includes(normalized));
}
