
import { createClient } from '@/utils/supabase/server';
import { redirect } from "next/navigation";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {/* Aquí puedes mostrar los posts o lo que necesites */}
      <p>Contenido principal de la aplicación.</p>
    </div>
  );
}
