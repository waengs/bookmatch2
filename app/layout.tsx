import type { Metadata } from 'next';
import { Playfair_Display, Inter, Nunito } from 'next/font/google';
import AuthSessionProvider from '@/components/SessionProvider';
import { JourneyProvider } from '@/context/JourneyContext';
import { BookMatchProvider } from '@/context/BookMatchContext';
import { CollectionProvider } from '@/context/CollectionContext';
import { ReadingQuestProvider } from '@/context/ReadingQuestContext';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BookMatch – Find Your Next Story',
  description:
    'BookMatch uses a personalized quiz to match you with books you\'ll actually finish and love.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${nunito.variable}`}>
      <body>
        <AuthSessionProvider>
          <JourneyProvider>
            <BookMatchProvider>
              <CollectionProvider>
                <ReadingQuestProvider>{children}</ReadingQuestProvider>
              </CollectionProvider>
            </BookMatchProvider>
          </JourneyProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
