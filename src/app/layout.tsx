import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'FoodBridge — Fresh Surplus Food to Verified NGOs',
  description: 'Connecting restaurant surplus food with local hunger relief NGOs through safe shelf-life tracking and real-time transit coordination.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col selection:bg-accent-primary/20 selection:text-ink">
        {/* Ambient Refracting Mesh Gradient Canvas */}
        <div className="ambient-mesh-canvas" aria-hidden="true">
          <div className="ambient-blob ambient-blob-amber" />
          <div className="ambient-blob ambient-blob-coral" />
          <div className="ambient-blob ambient-blob-sage" />
        </div>

        {/* Foreground App Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">{children}</main>

          <footer className="glass-standard border-t border-white/70 py-7 mt-16 text-xs text-ink-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-serif font-bold text-sm text-ink">FoodBridge</span>
                <span className="text-ink-light">A verified community food rescue network</span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <span className="inline-flex items-center gap-1.5 text-accent-trust font-medium">
                  <span className="w-2 h-2 rounded-full bg-accent-trust animate-pulse" />
                  Live route coordination
                </span>
                <span className="text-ink-muted">Verified food safety standards</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
