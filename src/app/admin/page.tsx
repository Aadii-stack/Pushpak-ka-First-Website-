'use client';

import { useEffect } from 'react';

export default function AdminDashboard() {
  useEffect(() => {
    window.location.replace('/');
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <p className="text-sm text-ink-muted">Redirecting to verified partner overview...</p>
    </div>
  );
}
