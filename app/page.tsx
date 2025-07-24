import { PostList } from '@/components/posts-list';
import { createClient } from '@/utils/supabase/server';
import { redirect } from "next/navigation";
import { PostsListData } from '@/types/posts';
import { ComposePost } from '@/components/compose-post-server';
import SidebarLayout from "@/components/SidebarLayout";
export default async function App() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user === null) {
    redirect('/login');
  }

  const { data: posts }: { data: PostsListData } = await supabase
    .from('posts')
    .select('*, users(*)')
    .order('created_at', { ascending: false });

  return (
    <main className="flex min-h-screen flex-row">
      {/* Sidebar a la izquierda */}
      <SidebarLayout />

      {/* Contenido principal a la derecha */}
      <div className="flex-1 p-6 overflow-y-auto">
        <ComposePost user={user} />
        <PostList posts={posts} />
      </div>
    </main>
  );
}
