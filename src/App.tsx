import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BottomNav from "@/components/layout/BottomNav";
import Index from "./pages/Index";
import Report from "./pages/Report";
import VoiceReport from "./pages/VoiceReport";
import OfficerPortal from "./pages/OfficerPortal";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute allowedRoles={["citizen"]}><Report /></ProtectedRoute>} />
            <Route path="/voice" element={<ProtectedRoute allowedRoles={["citizen"]}><VoiceReport /></ProtectedRoute>} />
            <Route path="/officer" element={<ProtectedRoute allowedRoles={["official"]}><OfficerPortal /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ProtectedBottomNav />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Only show BottomNav when authenticated
import { useAuth } from "@/contexts/AuthContext";
const ProtectedBottomNav = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <BottomNav />;
};

export default App;
