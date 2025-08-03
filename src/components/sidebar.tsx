
"use client"

import { usePathname } from "next/navigation";
import { ClipboardList, Dumbbell, LogOut } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { useAuth } from "./auth-provider";
import { cn } from "@/lib/utils";

const AppSidebar = () => {
    const pathname = usePathname();
    const { state } = useSidebar();
    const { logout } = useAuth();
  
    const handleLogout = () => {
      logout();
    }
    
    // We can't know the user on the server, so we check for loading state.
    // We also hide the sidebar on auth pages.
    const { user, loading } = useAuth();
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    if (loading || !user || isAuthPage) {
      return null;
    }


    return (
      <Sidebar side="left" collapsible="icon" className="border-r">
        <SidebarHeader className="justify-between">
          {state === 'expanded' && <Logo />}
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Workout">
                <Link href="/">
                    <Dumbbell />
                    <span>Workout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/templates')} tooltip="Templates">
                <Link href="/templates">
                    <ClipboardList />
                    <span>Templates</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2">
                <LogOut/>
                <span className={cn(state === 'collapsed' && 'hidden')}>Logout</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
    );
  };
  
  export default AppSidebar;

