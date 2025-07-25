// components/tableUI/Dashboard.tsx
import { createClient } from '@/utils/supabase/server';
import TableUI from '@/components/tableUI/TableUI';
import { Column } from '@/components/tableUI/tableInterfaces';
import { StatusOptions } from '@/components/tableUI/mockData';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: users, error } = await supabase.from('itinerary').select('*');

  if (error) {
    console.error('Error al obtener datos:', error.message);
    return <div>Error al cargar los datos</div>;
  }

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
    <div className="p-6">
      <TableUI 
        columns={columns} 
        data={normalizedUsers ?? []} 
        title="Itinerarios" 
        buttonsAdd={["Nuevo itinerario"]} 
      />
    </div>
  );
}