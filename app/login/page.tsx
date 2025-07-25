
//

import Dashboard from '@/components/tableUI/Dashboard';
import { AuthForm } from '@/components/auth-form';

export default async function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-6">Inicia sesión</h1>
    
        <AuthForm mode="login" />

        <div className="mt-6">
          {/* Aquí puedes agregar enlaces adicionales si es necesario */}
        </div>
      </div>
    </div>
  );
}
