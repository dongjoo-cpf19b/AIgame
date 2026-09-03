"use client";

import { useEffect, useState } from "react";

const SUPABASE_ORIGIN = "https://jkbselbyyfvupojlnbqk.supabase.co";
const RAFFLE_SUCCESS_TEXT = "응모가 완료되었습니다. 행운을 빕니다!";

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

      const requestHeaders = input instanceof Request ? input.headers : undefined;
      const headers = new Headers(init?.headers ?? requestHeaders);
      const authorization = headers.get("Authorization");

      // Supabase의 sb_publishable_* 키는 apikey 헤더로 전달한다.
      // 기존 코드의 publishable key Bearer 헤더는 제거한다.
      if (authorization?.includes("sb_publishable_")) {
        headers.delete("Authorization");
      }

      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      const fixedInit = { ...init, headers };

      // 게임 시작 세션 저장은 플레이를 막을 이유가 없다.
      // 요청은 백그라운드로 보내고 UI에는 즉시 성공 응답을 돌려준다.
      if (url.includes("/rest/v1/game_sessions") && method === "POST") {
        void originalFetch(input, fixedInit).catch(() => undefined);
        return new Response(null, { status: 201, statusText: "Created" });
      }

      // 게임 결과 PATCH 역시 화면 전환을 기다리지 않고 백그라운드 처리한다.
      if (url.includes("/rest/v1/game_sessions") && method === "PATCH") {
        void originalFetch(input, fixedInit).catch(() => undefined);
        return new Response(null, { status: 204, statusText: "No Content" });
      }

      // 경품 응모는 반드시 실제 저장 성공을 확인한다.
      if (url.includes("/rest/v1/raffle_entries") && method === "POST") {
        setRaffleLoading(true);
        try {
          return await originalFetch(input, fixedInit);
        } finally {
          setRaffleLoading(false);
        }
      }

      return originalFetch(input, fixedInit);
    };

    window.fetch = patchedFetch;

    const detectRaffleCompletion = () => {
      if (document.body.innerText.includes(RAFFLE_SUCCESS_TEXT)) {
        setRaffleComplete(true);
        setRaffleLoading(false);
      }
    };

    detectRaffleCompletion();
    const observer = new MutationObserver(detectRaffleCompletion);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (window.fetch === patchedFetch) {
        window.fetch = originalFetch;
      }
    };
  }, []);

  if (raffleComplete) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="raffle-complete-title"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "grid",
          placeItems: "center",
          padding: 20,
          background: "rgba(12, 18, 28, 0.84)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            width: "min(100%, 390px)",
            borderRadius: 24,
            padding: "28px 22px",
            background: "#ffffff",
            color: "#172033",
            boxShadow: "0 24px 70px rgba(0,0,0,.3)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 10 }}>🎁</div>
          <h2 id="raffle-complete-title" style={{ margin: "0 0 10px", fontSize: 24 }}>
            응모 완료
          </h2>
          <p style={{ margin: "0 0 8px", lineHeight: 1.7, fontWeight: 700 }}>
            경품 추첨 응모가 정상적으로 접수되었습니다.
          </p>
          <p style={{ margin: "0 0 22px", lineHeight: 1.6, color: "#667085", fontSize: 14 }}>
            같은 휴대전화 번호로는 한 번만 응모할 수 있습니다.
          </p>
          <div
            style={{
              padding: "13px 14px",
              borderRadius: 14,
              background: "#f3f6fb",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 18,
            }}
          >
            <strong>인수인계의 전설 · 플레이 완료</strong>
            <br />
            이제 결과 발표를 기다려주세요.
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              width: "100%",
              minHeight: 50,
              border: 0,
              borderRadius: 14,
              background: "#2457d6",
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            처음 화면으로
          </button>
        </div>
      </div>
    );
  }

  if (!raffleLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(12, 18, 28, 0.72)",
        backdropFilter: "blur(5px)",
      }}
    >
      <div
        style={{
          width: "min(100%, 330px)",
          borderRadius: 20,
          padding: "24px 20px",
          background: "#ffffff",
          color: "#172033",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,.28)",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 34,
            height: 34,
            margin: "0 auto 16px",
            border: "4px solid #dbe4f5",
            borderTopColor: "#2457d6",
            borderRadius: "50%",
            animation: "handover-spin .8s linear infinite",
          }}
        />
        <style>{`@keyframes handover-spin { to { transform: rotate(360deg); } }`}</style>
        <strong style={{ display: "block", fontSize: 18, marginBottom: 7 }}>
          응모 처리 중…
        </strong>
        <span style={{ color: "#667085", fontSize: 14, lineHeight: 1.6 }}>
          경품 응모 정보를 저장하고 있습니다.
          <br />
          잠시만 기다려주세요.
        </span>
      </div>
    </div>
  );
}
