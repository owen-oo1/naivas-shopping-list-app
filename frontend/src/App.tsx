import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import RoleGuard from "@/components/RoleGuard";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import ShoppingLists from "@/pages/ShoppingLists";
import ShoppingListDetail from "@/pages/ShoppingListDetail";
import Reports from "@/pages/Reports";
import Analytics from "@/pages/Analytics";
import Customers from "@/pages/Customers";
import AuthCallback from "@/pages/AuthCallback";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lists" element={<ShoppingLists />} />
              <Route path="/lists/:id" element={<ShoppingListDetail />} />
              <Route path="/reports" element={
                <RoleGuard roles={['manager', 'staff']}>
                  <Reports />
                </RoleGuard>
              } />
              <Route path="/analytics" element={
                <RoleGuard roles={['manager']}>
                  <Analytics />
                </RoleGuard>
              } />
              <Route path="/customers" element={
                <RoleGuard roles={['manager']}>
                  <Customers />
                </RoleGuard>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
