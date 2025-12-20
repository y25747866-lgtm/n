import type {Metadata} from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NexoraOS - AI Digital Product Factory',
  description: 'Generate ebooks, courses, covers, and trending digital assets instantly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <head/>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
