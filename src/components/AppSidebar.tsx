import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Users,
  Home,
  Heart,
  Settings,
  LogOut,
  FileText,
  BedDouble,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home, enabled: false },
  { title: "Triagens", url: "/triagens", icon: ClipboardList, enabled: true },
  { title: "Residentes", url: "/residentes", icon: BedDouble, enabled: false },
  { title: "Relatórios", url: "/relatorios", icon: FileText, enabled: false },
  { title: "Equipe", url: "/equipe", icon: Users, enabled: false },
  { title: "Configurações", url: "/configuracoes", icon: Settings, enabled: false },
];

export function AppSidebar() {
  const { signOut } = useAuth();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent">
            <Heart className="h-5 w-5 text-sidebar-accent-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-sidebar-foreground">
              SSVP
            </h2>
            <p className="text-xs text-sidebar-foreground/70">Gestão ILPI</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase text-[10px] font-bold tracking-widest text-sidebar-foreground/50 px-6">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    disabled={!item.enabled}
                    className={!item.enabled ? "opacity-40 pointer-events-none" : ""}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-6 py-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors rounded-md"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
