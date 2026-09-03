import type { Metadata } from "next";
import type { ReactNode } from "react";
import RuntimeFix from "./runtime-fix";
import "./globals.css";
import "./art-direction.css";
import "./viewport-fit.css";

export const metadata: Metadata = {
  title: "인수인계의 전설",
  description: "공무원 업무 인수인계 체험형 모바일 게임",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <RuntimeFix />
      </body>
    </html>
  );
}
