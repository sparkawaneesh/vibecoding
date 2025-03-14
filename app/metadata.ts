import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vibe-studio.vercel.app';

export const baseMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Vibe Studio - Code Editor & Design Tool',
    template: '%s | Vibe Studio',
  },
  description: 'An all-in-one creative workspace that combines a powerful code editor and a versatile design tool.',
  keywords: [
    'code editor',
    'design tool',
    'figma clone',
    'vscode clone',
    'creative workspace',
    'web development',
    'UI design',
    'collaborative',
    'next.js',
    'react',
  ],
  authors: [
    {
      name: 'Vibe Studio Team',
      url: baseUrl,
    },
  ],
  creator: 'Vibe Studio Team',
  publisher: 'Vibe Studio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'Vibe Studio - Code Editor & Design Tool',
    description: 'An all-in-one creative workspace that combines a powerful code editor and a versatile design tool.',
    siteName: 'Vibe Studio',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Vibe Studio - Code Editor & Design Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibe Studio - Code Editor & Design Tool',
    description: 'An all-in-one creative workspace that combines a powerful code editor and a versatile design tool.',
    images: [`${baseUrl}/twitter-image.png`],
    creator: '@vibestudio',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${baseUrl}/manifest.json`,
}; 