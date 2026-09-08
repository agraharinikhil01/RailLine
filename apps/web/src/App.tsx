import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { Journey } from './pages/Journey';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Helper for redirecting any legacy /journey/:trainNumber to /tracking/:trainNumber
const LegacyJourneyRedirect: React.FC = () => {
  const { trainNumber } = useParams<{ trainNumber: string }>();
  return <Navigate to={`/tracking/${trainNumber || '12951'}`} replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />
          <div className="flex-1">
            <Routes>
              {/* 1. Home / Search Screen */}
              <Route path="/" element={<Home />} />

              {/* 2. Train Tracking Screen */}
              <Route path="/tracking/:trainNumber" element={<Journey />} />

              {/* Legacy Redirect */}
              <Route path="/journey/:trainNumber" element={<LegacyJourneyRedirect />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
