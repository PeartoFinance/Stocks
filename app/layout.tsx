import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';
import { ThemeProvider } from './context/ThemeContext';
import LayoutWrapper from './components/layoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pearto Stocks - Professional Stock Market Analysis',
  description: 'Real-time stock data and investment insights.',
};

import AuthSync from './components/AuthSync';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <CountryProvider>
              <LayoutWrapper>
                <AuthSync />
                {children}
              </LayoutWrapper>
              <Toaster position="top-right" />
            </CountryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}