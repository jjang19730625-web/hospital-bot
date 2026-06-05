import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '병원 AI 상담봇',
  description: '증상 분석, 진료과 안내, 응급 여부 판단을 도와주는 AI 의료 상담 서비스',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${geist.className} antialiased h-full`}>{children}</body>
    </html>
  );
}
