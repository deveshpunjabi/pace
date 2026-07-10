/**
 * @module app/layout
 *
 * Root layout for the PACE application. Sets HTML metadata, applies the global
 * CSS, and provides the skip-to-content accessibility link that appears on
 * keyboard focus for screen reader users.
 */

import type { Metadata } from 'next';
import './globals.css';

/** SEO and social metadata for the PACE application. */
export const metadata: Metadata = {
  title: 'PACE — Predictive AI for Crowd & Environment',
  description:
    'P.A.C.E. is a GenAI stadium operations copilot for FIFA World Cup 2026: multilingual fan concierge, live crowd management, accessibility routing, transport, and sustainability.'
};

/** Root HTML layout with skip-link accessibility and global styles. */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:py-2 focus:font-bold focus:text-slate-950"
          href="#main"
        >
          Skip to content
        </a>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
