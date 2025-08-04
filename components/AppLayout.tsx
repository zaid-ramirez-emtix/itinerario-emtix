"use client";

import { usePathname } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import SidebarComponent from "./SidebarLayout";
import { Spinner } from "@heroui/react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Páginas donde NO se debe mostrar el sidebar
  const pagesWithoutSidebar = ["/login", "/signup", "/auth/confirm"];
  const shouldShowSidebar = user && !pagesWithoutSidebar.includes(pathname);

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
        {/* Sidebar fijo a la izquierda */}
        <aside className="w-72 h-screen sticky top-0 flex-shrink-0 border-r border-default-200">
          <SidebarComponent />
        </aside>

        {/* Contenido principal a la derecha */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  // Sin sidebar (páginas de login, etc.)
  return <>{children}</>;
}
