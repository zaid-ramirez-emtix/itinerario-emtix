'use client'

import Image from "next/image";
import LogoSVG from "@/assets/logo_golden.svg";
import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client"
import { useRouter } from 'next/navigation'

type AuthMode = 'login' | 'signup'

interface AuthFormProps {
  mode?: AuthMode;
}

// Componente del logo usando el SVG importado
const AcmeIcon = ({ size = 60 }: { size?: number }) => (
  <Image 
    src={LogoSVG}
    alt="Logo"
    width={size} 
    height={size}
    className="object-contain"
  />
)

export function AuthForm({ mode = 'login' }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = createClient();

    try {
      if (mode === 'signup') {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
          (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${baseUrl}/auth/confirm`,
            data: {
              name: email.split('@')[0],
              user_name: email.split('@')[0],
              avatar_url: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
            }
          }
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess('¡Inicio de sesión exitoso!');
          router.push('/');
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
        <div className="flex flex-col items-center pb-6">
          <AcmeIcon size={60} />
          <p className="text-xl font-medium">
            {mode === 'signup' ? 'Crear Cuenta' : 'Bienvenido de Vuelta'}
          </p>
          <p className="text-small text-default-500">
            {mode === 'signup' 
              ? 'Crea tu cuenta para comenzar' 
              : 'Inicia sesión en tu cuenta para continuar'
            }
          </p>
        </div>

        <Form className="flex flex-col gap-3" validationBehavior="native" action={handleSubmit}>
          <Input
            isRequired
            label="Email"
            name="email"
            placeholder="Ingresa tu email"
            type="email"
            variant="bordered"
            isDisabled={loading}
            errorMessage="Por favor, ingresa un email válido"
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Ingresa tu password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            isDisabled={loading}
            minLength={6}
          />

          {mode === 'login' && (
            <div className="flex w-full items-center justify-between px-1 py-2">
              <Checkbox name="remember" size="sm">
                Recordarme
              </Checkbox>
              
            </div>
          )}

          {error && (
            <div className="text-small text-danger bg-danger-50 p-2 rounded mb-2">
              {error}
            </div>
          )}
          
          {success && (
            <div className="text-small text-success bg-success-50 p-2 rounded mb-2">
              {success}
            </div>
          )}

          <Button 
            className="w-full" 
            color="primary" 
            type="submit"
            isLoading={loading}
            isDisabled={loading}
          >
            {loading ? 'Procesando...' : (mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión')}
          </Button>
        </Form>

        <p className="text-center text-small">
          {mode === 'login' ? (
            <>
              
          
            </>
          ) : (
            <>
              ¿Ya tienes una cuenta?&nbsp;
              <Link href="/login" size="sm">
                Inicia sesión aquí
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}