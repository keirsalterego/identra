import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ChatInterface from "./pages/ChatInterface";
import Launcher from "./pages/Launcher";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-identra-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-identra-primary to-identra-secondary flex items-center justify-center animate-pulse-subtle">
            <div className="w-6 h-6 rounded-full bg-white/25"></div>
          </div>
          <p className="text-sm text-identra-text-tertiary">Loading Identra...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Main App Layout/Logic
const AppContent = () => {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();
  const isLauncher = location.pathname === '/launcher';

  useEffect(() => {
    // Check if onboarding is needed (only for main window)
    // We might need to adjust this logic based on how Tauri handles windows/routes
    // For now, assuming standard SPA routing
    const onboarded = localStorage.getItem("identra-onboarded");
    if (!onboarded && !isLauncher) {
      setShowOnboarding(true);
    }

    setIsReady(true);
  }, [isLauncher]);

  if (!isReady) return null; // Or loading spinner

  if (showOnboarding && !isLauncher) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  // The Layout is handled by Routes in the main return
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/launcher" element={<Launcher />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatInterface />
          </ProtectedRoute>
        }
      />
      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  // Determine if this is a secondary window (Launcher) via query param or initial check if possible
  // In Tauri v2 multi-window, they might load same index.html but we route them differently
  // For simplicity, let's assume hash routing handles it if we navigate properly

  // Checking for launcher window context if applicable
  const isLauncherWindow = globalThis.location.pathname === '/launcher.html';

  if (isLauncherWindow) {
    return <Launcher />;
  }

  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
}