'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import TableUI from '../components/tableUI/TableUI';

import { Column } from '../components/tableUI/tableInterfaces';
// import { users } from '../components/tableUI/mockData';
import { StatusOptions } from '../components/tableUI/mockData'; // ya lo tienes definido

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tableKey, setTableKey] = useState(0); // Key para forzar re-render

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Verificar autenticación
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser === null) {
        redirect('/login');
        return;
      }

      setUser(authUser);

      // Obtener datos de itinerarios ordenados por fecha de creación (más recientes primero)
      const { data: itineraries, error } = await supabase
        .from('itinerary')
        .select('*')
        .order('start_date', { ascending: false }); // Ordenar por fecha de inicio, más recientes primero

      if (error) {
        console.error('Error al obtener datos:', error.message);
        setLoading(false);
        return;
      }

      // Normalizar los datos para utilizarlos en la tabla
      const normalizedUsers = itineraries?.map((itinerary) => {
        const status: StatusOptions = itinerary.active ? 'Activo' : 'Inactivo';
        
        // Función para crear fechas locales evitando problemas de zona horaria
        const createLocalDate = (dateString: string) => {
          const dateParts = dateString.split('T')[0].split('-');
          return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        };

        return {
          id: itinerary.id_itinerary,
          title: itinerary.title,
          destination: itinerary.destination,
          language: `${itinerary.language}`.toUpperCase(),
          start_date: createLocalDate(itinerary.start_date),
          end_date: createLocalDate(itinerary.end_date),
          status,
        };
      }) || [];

      setData(normalizedUsers);
      setLoading(false);
    }

    fetchData();
  }, []);

  // Crear las columnas de las tablas
  const columns: Column[] = [
    { name: 'Clave', uid: 'id', columnType: 'default' },
    { name: 'Título', uid: 'title', columnType: 'default', sortDirection: 'ascending', filterSearch: true },
    { name: 'Destino', uid: 'destination', columnType: 'default' },
    { name: 'Lenguaje', uid: 'language', columnType: 'default' },
    { name: 'Fecha de inicio', uid: 'start_date', columnType: 'date' },
    { name: 'Fecha de fin', uid: 'end_date', columnType: 'date' },
    { name: 'Estatus', uid: 'status', columnType: 'status' },
    { name: 'Acciones', uid: 'actions', columnType: 'itinerary-actions' },
  ];

  // Función para refrescar datos desde Supabase
  const refreshData = async () => {
    const supabase = createClient();
    const { data: itineraries, error } = await supabase
      .from('itinerary')
      .select('*')
      .order('start_date', { ascending: false }); // Mismo ordenamiento que la carga inicial

    if (error) {
      console.error('Error al refrescar datos:', error.message);
      return;
    }

    // Normalizar los datos
    const normalizedUsers = itineraries?.map((itinerary) => {
      const status: StatusOptions = itinerary.active ? 'Activo' : 'Inactivo';
      
      const createLocalDate = (dateString: string) => {
        const dateParts = dateString.split('T')[0].split('-');
        return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
      };

      return {
        id: itinerary.id_itinerary,
        title: itinerary.title,
        destination: itinerary.destination,
        language: `${itinerary.language}`.toUpperCase(),
        start_date: createLocalDate(itinerary.start_date),
        end_date: createLocalDate(itinerary.end_date),
        status,
      };
    }) || [];

    setData(normalizedUsers);
    setTableKey(prev => prev + 1);
    console.log('🔄 Datos refrescados desde Supabase:', normalizedUsers.length, 'items');
  };

  // Función para manejar cambios en los datos
  const handleDataChange = (newData: any[]) => {
    setData(newData);
    setTableKey(prev => prev + 1); // Incrementar key para forzar re-render
  };

  // Función alternativa para refrescar después de agregar
  const handleItineraryAdded = () => {
    console.log('🔄 Refrescando datos después de agregar itinerario...');
    refreshData();
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section>
        <TableUI 
          key={tableKey} // Key que cambia para forzar re-render
          columns={columns} 
          data={data} 
          title='Itinerarios' 
          buttonsAdd={['Nuevo itinerario']} 
          onDataChange={handleDataChange}
        />
      </section>
    </main>
  );
}

