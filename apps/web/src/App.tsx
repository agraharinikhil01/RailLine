import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { TrackingPage } from './pages/TrackingPage';

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
              {/* Route 1: Home/Search Screen */}
              <Route path="/" element={<HomePage />} />

              {/* Route 2: Train Tracking Screen */}
              <Route path="/tracking/:trainNumber" element={<TrackingPage />} />

              {/* Legacy fallback */}
              <Route path="/journey/:trainNumber" element={<LegacyJourneyRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
