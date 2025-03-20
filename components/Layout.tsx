import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main>{children}</main>
      </div>
    </SessionProvider>
  );
} 