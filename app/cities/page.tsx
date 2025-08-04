'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import TableUI from '@/components/tableUI/TableUI';

import { Column } from '@/components/tableUI/types';
import { createLocalDate } from '@/helpers/dates';

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tableKey, setTableKey] = useState(0); // Key para forzar re-render

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: cities, error } = await supabase.from('city').select('*');

      if (error) {
        console.error('Error al obtener datos:', error.message);
        setLoading(false);
        return;
      }

      // Normalizar los datos para utilizarlos en la tabla
      const normalizedCities =
        cities.map((city) => {
          return {
            id: city.id_city,
            name: city.city_name,
            image: city.city_image_path,
            created_at: createLocalDate(city.created_at),
            updated_at: createLocalDate(city.updated_at),
          };
        }) || [];

      setData(normalizedCities);
      setLoading(false);
    }

    fetchData();
  }, []);

  // Crear las columnas de las tablas
  const columns: Column[] = [
    { name: 'Clave', uid: 'id', columnType: 'default', visible: false },
    { name: 'Nombre', uid: 'name', columnType: 'default', sortDirection: 'ascending', filterSearch: true },
    { name: 'Imagen', uid: 'image', columnType: 'default' },
    { name: 'Fecha de creación', uid: 'created_at', columnType: 'date' },
    { name: 'Última modificación', uid: 'updated_at', columnType: 'date' },
    { name: 'Acciones', uid: 'actions', columnType: 'itinerary-actions' },
  ];

  // Función para refrescar datos desde Supabase
  const refreshData = async () => {
    const supabase = createClient();
    const { data: cities, error } = await supabase.from('city').select('*');

    if (error) {
      console.error('Error al refrescar datos:', error.message);
      return;
    }

    // Normalizar los datos
    const normalizedCities =
      cities.map((city) => {
        return {
          id: city.id_city,
          name: city.city_name,
          image: city.city_image_path,
          created_at: createLocalDate(city.created_at),
          updated_at: createLocalDate(city.updated_at),
        };
      }) || [];

    setData(normalizedCities);
    setTableKey((prev) => prev + 1);
    console.log('🔄 Datos refrescados desde Supabase:', normalizedCities.length, 'items');
  };

  // Función para manejar cambios en los datos
  const handleDataChange = (newData: any[]) => {
    setData(newData);
    setTableKey((prev) => prev + 1); // Incrementar key para forzar re-render
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
          title="Catálogo de ciudades"
          buttonsAdd={['Agregar nueva ciudad']}
          onDataChange={handleDataChange}
        />
      </section>
    </main>
  );
}
