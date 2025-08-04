// components/SidebarLayout.tsx
"use client";

import React from "react";
import { ThemeSwitch } from "./theme-switch";
import { Button, ScrollShadow, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import LogoSVG from "@/public/logo_golden.svg";
import Image from "next/image";

import { sectionNestedItems } from "./sidebar-items";
import Sidebar from "./sidebar";

export default function SidebarComponent({ 
  isCollapsed = false, 
  onToggleCollapse 
}: { 
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Función para determinar qué key debe estar seleccionado basado en la ruta actual
  const getSelectedKeyFromPath = (): string => {
    if (pathname === '/') return 'dashboard';
    if (pathname === '/itinerary') return 'itinerary';
    if (pathname === '/cities') return 'cities';
    
    // Por defecto, dashboard
    return 'dashboard';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSidebarSelect = (key: string) => {
    // Buscar el item en sectionNestedItems para obtener su href
    const findItemByKey = (items: any[], targetKey: string): any => {
      for (const item of items) {
        if (item.key === targetKey && item.href) {
          return item;
        }
        if (item.items) {
          const found = findItemByKey(item.items, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedItem = findItemByKey(sectionNestedItems, key);
    if (selectedItem && selectedItem.href && selectedItem.href !== '#') {
      router.push(selectedItem.href);
    }
  };

  return (
    <div className={`h-screen border-r-small border-divider bg-background transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      <div className="flex h-full flex-col">
        {/* Header con logo personalizado */}
        <div className={`flex items-center gap-2 px-4 py-4 ${isCollapsed ? 'justify-center px-2' : ''}`}>
          {isCollapsed ? (
            <Tooltip content="Golden Maya" placement="right">
              <div className="h-8 w-8">
                <Image src={LogoSVG} alt="Logo" width={30} height={40} className="object-contain" />
              </div>
            </Tooltip>
          ) : (
            <>
              <div className="h-8 w-8">
                <Image src={LogoSVG} alt="Logo" width={30} height={40} className="object-contain" />
              </div>
              <span className="text-small font-bold uppercase">Golden Maya</span>
            </>
          )}
        </div>

        {/* Botón hamburguesa para contraer/expandir */}
        {onToggleCollapse && (
          <div className={`px-4 pb-2 ${isCollapsed ? 'px-2' : ''}`}>
            <Tooltip content={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"} placement="right">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onToggleCollapse}
                className="w-full justify-center text-default-500 data-[hover=true]:text-foreground"
              >
                <Icon 
                  icon={isCollapsed ? "solar:double-alt-arrow-right-line-duotone" : "solar:double-alt-arrow-left-line-duotone"} 
                  width={18} 
                />
              </Button>
            </Tooltip>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <ScrollShadow className="h-full px-2">
            <Sidebar 
              defaultSelectedKey="dashboard"
              selectedKey={getSelectedKeyFromPath()}
              items={sectionNestedItems} 
              isCompact={isCollapsed}
              onItemSelect={handleSidebarSelect}
            />
          </ScrollShadow>
        </div>

        {/* Footer */}
        <div className="border-t border-divider p-4">
          <div className="flex flex-col gap-2">
            {!isCollapsed && <ThemeSwitch />}
            {isCollapsed ? (
              <Tooltip content="Cerrar Sesión" placement="right">
                <Button
                  isIconOnly
                  onClick={handleLogout}
                  className="justify-center text-default-500 data-[hover=true]:text-foreground"
                  variant="light"
                >
                  <Icon
                    className="rotate-180 text-default-500"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                </Button>
              </Tooltip>
            ) : (
              <Button
                fullWidth
                onClick={handleLogout}
                className="justify-start text-default-500 data-[hover=true]:text-foreground"
                startContent={
                  <Icon
                    className="rotate-180 text-default-500"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                }
                variant="light"
              >
                Cerrar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
