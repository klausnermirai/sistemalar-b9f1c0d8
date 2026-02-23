import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Setup from "@/pages/Setup";
import Triagens from "@/pages/Triagens";
import Settings from "@/pages/Settings";
import Residentes from "@/pages/Residentes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup" element={<Setup />} />
            <Route
              path="/"
              element={
                <AppLayout>
                  <Navigate to="/triagens" replace />
                </AppLayout>
              }
            />
            <Route
              path="/triagens"
              element={
                <AppLayout>
                  <Triagens />
                </AppLayout>
              }
            />
            <Route
              path="/residentes"
              element={
                <AppLayout>
                  <Residentes />
                </AppLayout>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <AppLayout>
                  <Settings />
                </AppLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
