"use client";

import { useEffect, useState } from "react";

const SUPABASE_ORIGIN = "https://jkbselbyyfvupojlnbqk.supabase.co";

function parseBody(init?: RequestInit) {
  if (!init?.body || typeof init.body !== "string") return {};
  try {
    return JSON.parse(init.body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export default function RuntimeFix() {
  const [raffleLoading, setRaffleLoading] = useState(false);
  const [raffleComplete, setRaffleComplete] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const patchedFetch: typeof window.fetch = async (input, init) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (!url.startsWith(SUPABASE_ORIGIN)) {
        return originalFetch(input, init);
      }

      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      const body = parseBody(init);

      // 첫 화면은 DB 응답을 기다리지 않는다.
      // Vercel 서버 API가 백그라운드에서 Supabase 세션을 생성한다.
      if (url.includes("/rest/v1/game_sessions") && method === "POST") {
        const id = String(body.id ?? "");
        void originalFetch("/api/game-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "start", id }),
        }).catch((error) => console.error("session start background error", error));

        return new Response(null, { status: 202, statusText: "Accepted" });
      }

      // 결과 저장도 화면 흐름을 막지 않고 백그라운드 처리한다.
      if (url.includes("/rest/v1/game_sessions") && method === "PATCH") {
        const parsed = new URL(url);
        const filter = parsed.searchParams.get("id") ?? "";
        const id = filter.startsWith("eq.") ? filter.slice(3) : filter;

        void originalFetch("/api/game-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "finish", id, ...body }),
        }).catch((error) => console.error("session finish background error", error));

        return new Response(null, { status: 202, statusText: "Accepted" });
      }

      // 마지막 응모는 실제 저장 성공을 확인해야 한다.
      if (url.includes("/rest/v1/raffle_entries") && method === "POST") {
        setRaffleLoading(true);
        try {
          const response = await originalFetch("/api/raffle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            setRaffleComplete(true);
          }
          return response;
        } finally {
          setRaffleLoading(false);
        }
      }

      return originalFetch(input, init);
    };

    window.fetch = patchedFetch;
    return () => {
      if (window.fetch === patchedFetch) window.fetch = originalFetch;
    };
  }, []);

  if (raffleComplete) {
    return (
      <div role="dialog" aria-modal="true" aria-labelledby="raffle-complete-title" style={{position:"fixed",inset:0,zIndex:10000,display:"grid",placeItems:"center",padding:20,background:"rgba(12,18,28,.84)",backdropFilter:"blur(8px)"}}>
        <div style={{width:"min(100%,390px)",borderRadius:24,padding:"28px 22px",background:"#fff",color:"#172033",boxShadow:"0 24px 70px rgba(0,0,0,.3)",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:10}}>🎁</div>
          <h2 id="raffle-complete-title" style={{margin:"0 0 10px",fontSize:24}}>응모 완료</h2>
          <p style={{margin:"0 0 8px",lineHeight:1.7,fontWeight:700}}>경품 추첨 응모가 정상적으로 접수되었습니다.</p>
          <p style={{margin:"0 0 22px",lineHeight:1.6,color:"#667085",fontSize:14}}>같은 휴대전화 번호로는 한 번만 응모할 수 있습니다.</p>
          <div style={{padding:"13px 14px",borderRadius:14,background:"#f3f6fb",fontSize:14,lineHeight:1.6,marginBottom:18}}>
            <strong>인수인계의 전설 · 플레이 완료</strong><br/>이제 결과 발표를 기다려주세요.
          </div>
          <button type="button" onClick={() => window.location.reload()} style={{width:"100%",minHeight:50,border:0,borderRadius:14,background:"#2457d6",color:"#fff",fontSize:16,fontWeight:800,cursor:"pointer"}}>처음 화면으로</button>
        </div>
      </div>
    );
  }

  if (!raffleLoading) return null;

  return (
    <div role="status" aria-live="polite" style={{position:"fixed",inset:0,zIndex:9999,display:"grid",placeItems:"center",padding:20,background:"rgba(12,18,28,.72)",backdropFilter:"blur(5px)"}}>
      <div style={{width:"min(100%,330px)",borderRadius:20,padding:"24px 20px",background:"#fff",color:"#172033",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.28)"}}>
        <div aria-hidden="true" style={{width:34,height:34,margin:"0 auto 16px",border:"4px solid #dbe4f5",borderTopColor:"#2457d6",borderRadius:"50%",animation:"handover-spin .8s linear infinite"}} />
        <style>{`@keyframes handover-spin { to { transform: rotate(360deg); } }`}</style>
        <strong style={{display:"block",fontSize:18,marginBottom:7}}>응모 처리 중…</strong>
        <span style={{color:"#667085",fontSize:14,lineHeight:1.6}}>경품 응모 정보를 안전하게 저장하고 있습니다.<br/>잠시만 기다려주세요.</span>
      </div>
    </div>
  );
}
