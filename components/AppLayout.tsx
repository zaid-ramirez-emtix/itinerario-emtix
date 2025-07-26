"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import SidebarComponent from "./SidebarLayout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  // Páginas donde NO se debe mostrar el sidebar
  const pagesWithoutSidebar = ["/login", "/auth/confirm"];
  const shouldShowSidebar = user && !pagesWithoutSidebar.includes(pathname);

  useEffect(() => {
    // Obtener usuario actual
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
