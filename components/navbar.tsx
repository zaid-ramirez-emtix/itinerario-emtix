'use client'

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

import { ThemeSwitch } from "@/components/theme-switch";
import { TwitterIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";

export const Navbar = () => {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <TwitterIcon />
            <p className="font-bold text-inherit">Twitter</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        
        {loading ? (
          <NavbarItem>
            <div>Cargando...</div>
          </NavbarItem>
        ) : user ? (
          <>
            <NavbarItem className="hidden md:flex">
              <span className="text-sm">Hola, {user.user_metadata.user_name}</span>
            </NavbarItem>
            <NavbarItem className="hidden md:flex">
              <Button 
                color="danger" 
                variant="flat" 
                onPress={handleSignOut}
              >
                Cerrar sesión
              </Button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="hidden md:flex">
              <NextLink href="/login">
                <Button color="primary" variant="flat">
                  Iniciar sesión
                </Button>
              </NextLink>
            </NavbarItem>
            <NavbarItem className="hidden md:flex">
              <NextLink href="/signup">
                
              </NextLink>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>
    </HeroUINavbar>
  );
};
