import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { API_URL } from '@/lib/data';
import Background from '@/components/Background';
import DataProvider from '@/components/DataProvider';
import SiteShell from '@/components/SiteShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
export async function generateMetadata(): Promise<Metadata> {
  let title = 'MD Rijuan Monju — Full-Stack Developer', description = 'Portfolio of MD Rijuan Monju, full-stack developer from Chattogram, Bangladesh.';
  try {
    const siteResponse = await (await fetch(`${API_URL}/api/site`, { next: { revalidate: 60 } })).json();
    title = siteResponse.settings?.site_title || title; description = siteResponse.settings?.site_description || description;
  } catch { }
  return { title, description };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#030c0b' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try{var c=localStorage.getItem('themeCss');if(c){var s=document.createElement('style');s.id='theme-css';s.textContent=c;document.head.appendChild(s)}var m=localStorage.getItem('theme');if(m==='light'||(!m&&localStorage.getItem('defaultMode')==='light'))document.documentElement.classList.add('light')}catch(e){}" }} /></head>
      <body
        className={`${inter.variable} ${mono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
      >
        <Background />
        <DataProvider><SiteShell>{children}</SiteShell></DataProvider>
      </body>
    </html>
  );
}
