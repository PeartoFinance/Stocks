import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';
import LayoutWrapper from './components/layoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pearto Stocks - Professional Stock Market Analysis',
  description: 'Real-time stock data and investment insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AuthProvider>
          <CountryProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster position="top-right" />
          </CountryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}