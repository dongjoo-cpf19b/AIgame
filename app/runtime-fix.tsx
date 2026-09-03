"use client";

import { useEffect, useState } from "react";

const SUPABASE_ORIGIN = "https://jkbselbyyfvupojlnbqk.supabase.co";
const RAFFLE_SUCCESS_TEXT = "응모가 완료되었습니다. 행운을 빕니다!";

export default function RuntimeFix() {
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

      if (url.startsWith(SUPABASE_ORIGIN)) {
        const requestHeaders =
          input instanceof Request ? input.headers : undefined;
        const headers = new Headers(init?.headers ?? requestHeaders);
        const authorization = headers.get("Authorization");

        // Supabase의 새 sb_publishable_* 키는 apikey 헤더로 전달한다.
        // 기존 코드가 publishable key를 Bearer 토큰으로도 넣어 요청을 막는 경우를 방지한다.
        if (authorization?.includes("sb_publishable_")) {
          headers.delete("Authorization");
        }

        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    window.fetch = patchedFetch;

    const detectRaffleCompletion = () => {
      if (document.body.innerText.includes(RAFFLE_SUCCESS_TEXT)) {
        setRaffleComplete(true);
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

  if (!raffleComplete) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="raffle-complete-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(12, 18, 28, 0.82)",
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
        <h2
          id="raffle-complete-title"
          style={{ margin: "0 0 10px", fontSize: 24 }}
        >
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
