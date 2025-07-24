import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { PostsListData } from '@/types/posts';
import TableUI from '../components/tableUI/TableUI';

export default async function App() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect('/login');
  }

  const { data: posts }: { data: PostsListData } = await supabase.from('posts').select('*, users(*)').order('created_at', { ascending: false });
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section>
        <TableUI />
      </section>
    </main>
  );
}
