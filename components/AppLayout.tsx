"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import SidebarComponent from "./SidebarLayout";
import { Spinner, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Páginas donde NO se debe mostrar el sidebar
  const pagesWithoutSidebar = ["/login", "/signup", "/auth/confirm"];
  const shouldShowSidebar = user && !pagesWithoutSidebar.includes(pathname);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-gray-600 dark:text-gray-300">Cargando...</p>
        </div>
      </div>
    );
  }

  if (shouldShowSidebar) {
    return (
      <div className="flex min-h-screen">
        {/* Sidebar colapsable */}
        <aside className={`h-screen sticky top-0 flex-shrink-0 border-r border-default-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}>
          <SidebarComponent 
            isCollapsed={sidebarCollapsed} 
            onToggleCollapse={toggleSidebar}
          />
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // Sin sidebar (páginas de login, etc.)
  return <>{children}</>;
}
