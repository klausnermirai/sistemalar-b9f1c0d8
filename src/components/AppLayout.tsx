import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate, useLocation } from "react-router-dom";
import { MuralBadge } from "@/components/mural/MuralBadge";

const ROUTE_MODULE_MAP: Record<string, string> = {
  "/triagens": "triagens",
  "/residentes": "residentes",
  "/atendimento": "atendimento",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { canAccess, loading: roleLoading } = useUserRole();
  const location = useLocation();

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Route guard
  const module = ROUTE_MODULE_MAP[location.pathname];
  const blocked = module && !canAccess(module as any);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="flex h-14 items-center border-b bg-card px-4">
            <SidebarTrigger className="mr-4" />
            <div className="ml-auto">
              <MuralBadge />
            </div>
          </header>
          <div className="flex-1 p-6">
            {blocked ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-lg font-semibold text-muted-foreground">
                  Você não tem permissão para acessar esta área.
                </p>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
