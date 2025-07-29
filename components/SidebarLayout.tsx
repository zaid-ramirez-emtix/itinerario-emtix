// components/SidebarLayout.tsx
"use client";

import React from "react";
import { Avatar, Button, ScrollShadow } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import LogoSVG from "@/assets/logo_golden.svg";
import Image from "next/image";

import { sectionNestedItems } from "./sidebar-items";
import Sidebar from "./sidebar";

export default function SidebarComponent() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="h-screen w-72 border-r-small border-divider bg-background">
      <div className="flex h-full flex-col">
        {/* Header con logo personalizado */}
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="h-8 w-8">
            <Image src={LogoSVG} alt="Logo" width={30} height={40} className="object-contain" />
          </div>
          <span className="text-small font-bold uppercase">Acme</span>
        </div>

       {/*
<div className="flex items-center gap-3 px-4 pb-4">
  <Avatar isBordered size="sm" src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
  <div className="flex flex-col">
    <p className="text-small font-medium text-default-600">Kate Moore</p>
    <p className="text-tiny text-default-400">Customer Support</p>
  </div>
</div>
*/}
        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <ScrollShadow className="h-full px-2">
            <Sidebar defaultSelectedKey="home" items={sectionNestedItems} />
          </ScrollShadow>
        </div>

        {/* Footer */}
        <div className="border-t border-divider p-4">
          <div className="flex flex-col gap-2">
            <Button
              fullWidth
              className="justify-start text-default-500 data-[hover=true]:text-foreground"
              startContent={
                <Icon className="text-default-500" icon="solar:info-circle-line-duotone" width={24} />
              }
              variant="light"
            >
              Help & Information
            </Button>
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
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
