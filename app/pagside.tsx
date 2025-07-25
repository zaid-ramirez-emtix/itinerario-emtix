
import { createClient } from '@/utils/supabase/server';
import { redirect } from "next/navigation";

import SidebarLayout from "@/components/SidebarLayout";

export default async function App() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user === null) {
    redirect('/login');
  }

  // Comentado: tabla 'posts' no existe en este proyecto
  // const { data: posts }: { data: PostsListData } = await supabase
  //   .from('posts')
  //   .select('*, users(*)')
  //   .order('created_at', { ascending: false });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fijo a la izquierda */}
      <aside className="w-72 h-screen sticky top-0 flex-shrink-0 border-r border-default-200">
       
        <SidebarLayout />
      </aside>

      {/* Contenido principal a la derecha */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Aquí puedes mostrar los posts o lo que necesites */}
      </main>
    </div>
  );
}
