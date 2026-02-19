import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CountryProvider } from './context/CountryContext';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import LayoutWrapper from './components/layoutWrapper';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'Pearto Stocks - Professional Stock Market Analysis',
  description: 'Real-time stock data and investment insights.',
};

import AuthSync from './components/AuthSync';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <CurrencyProvider>
                <CountryProvider>
                  <LayoutWrapper>
                    <AuthSync />
                    {children}
                  </LayoutWrapper>
                  <Toaster position="top-right" />
                </CountryProvider>
              </CurrencyProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}