import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Football Trivia Quiz - Test Your Soccer Knowledge',
  description: 'An interactive, responsive, and beautiful football quiz with detailed match statistics and tactile gameplay breakdown.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="font-sans antialiased bg-[#05070A] text-[#F0F6FC] min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
