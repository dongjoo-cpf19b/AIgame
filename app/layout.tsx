import type {Metadata,Viewport} from "next";
import "./globals.css";
import "./pc-realism.css";
export const metadata:Metadata={title:"인수인계의 전설 | DLC 오락실",description:"전임자는 떠났습니다. 인수인계서는 없습니다. 작은 단서를 따라 완성하는 나의 첫 업무. 모바일 인수인계 체험 게임.",robots:{index:false,follow:false}};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover",themeColor:"#102b3b"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>;}
