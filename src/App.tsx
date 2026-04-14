import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ThreatScanner from './pages/ThreatScanner';
import AlertCenter from './pages/AlertCenter';
import AwarenessHub from './pages/AwarenessHub';
import IntelligenceCenter from './pages/IntelligenceCenter';
import AuthPage from './pages/AuthPage';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/auth" />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-cyan selection:text-bg-primary">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/scanner" element={
                <PrivateRoute>
                  <ThreatScanner />
                </PrivateRoute>
              } />
              
              <Route path="/alerts" element={
                <PrivateRoute>
                  <AlertCenter />
                </PrivateRoute>
              } />
              
              <Route path="/awareness" element={
                <PrivateRoute>
                  <AwarenessHub />
                </PrivateRoute>
              } />

              <Route path="/intelligence" element={
                <PrivateRoute>
                  <IntelligenceCenter />
                </PrivateRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            
            {/* Footer */}
            <footer className="py-12 border-t border-white/5 mt-20">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-accent-cyan/10 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-accent-cyan rounded-sm" />
                  </div>
                  <span className="text-xl font-display font-bold tracking-tighter">
                    SECURE<span className="text-accent-cyan">X</span>
                  </span>
                </div>
                <p className="text-text-muted text-sm">
                  © 2026 SecureX Security. All rights reserved. <br />
                  <span className="text-[10px] uppercase tracking-widest font-bold mt-2 block">Enterprise Grade Fraud Detection</span>
                </p>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
