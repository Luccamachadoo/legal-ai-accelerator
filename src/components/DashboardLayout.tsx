import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadAlertasCount } from "@/hooks/useData";
import { useRealtimeAlertas } from "@/hooks/useRealtimeAlertas";

export function DashboardLayout() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadAlertasCount();
  const navigate = useNavigate();
  useRealtimeAlertas();

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Alternar tema"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/alertas")}>
                <Bell className="h-4 w-4" />
                {(unreadCount ?? 0) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] holly-gradient border-0 text-primary-foreground">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <div className="flex items-center gap-2 ml-2">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full holly-gradient flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
