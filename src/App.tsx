import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import LocationsPage from "@/pages/LocationsPage";
import EmployeesPage from "@/pages/EmployeesPage";
import SuppliesPage from "@/pages/SuppliesPage";
import MaintenancePage from "@/pages/MaintenancePage";
import HistoryPage from "@/pages/HistoryPage";
import ReportsPage from "@/pages/ReportsPage";
import LoginPage from "@/pages/LoginPage";
import ChecklistTemplatesPage from "@/pages/ChecklistTemplatesPage";
import LeadsPage from "@/pages/LeadsPage";
import NotFound from "./pages/NotFound.tsx";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        {/* Sync trigger comment */}
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <AppProvider>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/locais" element={<AdminRoute><LocationsPage /></AdminRoute>} />
          <Route path="/funcionarios" element={<AdminRoute><EmployeesPage /></AdminRoute>} />
          <Route path="/insumos" element={<AdminRoute><SuppliesPage /></AdminRoute>} />
          <Route path="/manutencao" element={<MaintenancePage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="/leads" element={<AdminRoute><LeadsPage /></AdminRoute>} />
          <Route path="/relatorios" element={<AdminRoute><ReportsPage /></AdminRoute>} />
          <Route path="/modelos-checklists" element={<AdminRoute><ChecklistTemplatesPage /></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </AppProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
