import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TableUI from '../components/tableUI/TableUI';

import { Column } from '../components/tableUI/tableInterfaces';
// import { users } from '../components/tableUI/mockData';
import { StatusOptions } from '../components/tableUI/mockData'; // ya lo tienes definido

export default async function App() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect('/login');
  }

  // Conexión con la base de datos
  const { data: users, error } = await supabase.from('itinerary').select('*');

  if (error) {
    console.error('Error al obtener datos:', error.message);
    return <div>Error al cargar los datos</div>;
  }

  // Normalizar los datos para utilizarlos en la tabla
  const normalizedUsers = users?.map((user) => {
    const status: StatusOptions = user.active ? 'Activo' : 'Inactivo';

    return {
      id: user.id_itinerary,
      title: user.title,
      destination: user.destination,
      language: `${user.language}`.toUpperCase(),
      start_date: new Date(user.start_date),
      end_date: new Date(user.end_date),
      status,
    };
  });

  // Crear las columnas de las tablas
  const columns: Column[] = [
    { name: 'Clave', uid: 'id', columnType: 'default' },
    { name: 'Título', uid: 'title', columnType: 'default', sortDirection: 'ascending', filterSearch: true },
    { name: 'Destino', uid: 'destination', columnType: 'default' },
    { name: 'Lenguaje', uid: 'language', columnType: 'default' },
    { name: 'Fecha de inicio', uid: 'start_date', columnType: 'date' },
    { name: 'Fecha de fin', uid: 'end_date', columnType: 'date' },
    { name: 'Estatus', uid: 'status', columnType: 'status' },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section>
        <TableUI columns={columns} data={normalizedUsers ?? []} title='Itinerarios' buttonsAdd={['Nuevo itinerario']} />
      </section>
    </main>
  );
}
