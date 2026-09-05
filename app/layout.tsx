import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { LanguageProvider } from '@/components/i18n/language-provider';
import { SiteTranslationLayer } from '@/components/i18n/site-translation-layer';
import './globals.css';
import './vivatrip-redesign.css';
import './explore-width-fix.css';
import './flight-search-fix.css';
import './homepage-hero-background.css';
import './home-destinations-polish.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vivatrip.vercel.app'),
  title: { default: 'VivaTrip — Planeje viagens com inteligência', template: '%s | VivaTrip' },
  description: 'Planeje viagens, organize roteiros, pré-viagem e alertas em um único lugar.',
  openGraph: {
    title: 'VivaTrip — O mundo mais perto de você.',
    description: 'Planeje viagens, organize roteiros, pré-viagem e alertas em um único lugar.',
    images: [{ url: '/og.png', width: 1732, height: 909, alt: 'VivaTrip — O mundo mais perto de você.' }],
  },
  robots: { index: true, follow: true },
  twitter: {
    card: 'summary_large_image',
    title: 'VivaTrip — O mundo mais perto de você.',
    description: 'Planeje viagens, organize roteiros, pré-viagem e alertas em um único lugar.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <SiteTranslationLayer />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
