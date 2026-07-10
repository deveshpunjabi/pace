import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PACE - Predictive AI for Crowd & Environment',
  description:
    'P.A.C.E. is a GenAI stadium operations copilot for FIFA World Cup 2026 crowd management, multilingual fan support, and sustainability.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
