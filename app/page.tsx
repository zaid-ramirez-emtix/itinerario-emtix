'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import TableUI from '@/components/tableUI/TableUI';
import { itineraryDeleteConfig, itineraryToggleStatusConfig } from '@/components/tableUI/deleteConfigs';
import { Spinner } from '@heroui/react'
import { Column } from '@/components/tableUI/types';
import { StatusOptions } from '@/components/tableUI/mockData';
import { Itinerary } from '@/types/itinerary';

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableKey, setTableKey] = useState(0); // Key para forzar re-render
  
  // Normalizar los datos para utilizarlos en la tabla
  const getNormalizedItineraries = (itineraries: Itinerary[]) => {
    return itineraries.map((itinerary) => {
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
        created_at: createLocalDate(itinerary.created_at),
        updated_at: createLocalDate(itinerary.updated_at),
      };
    }) || [];
  }

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // El middleware ya verifica la autenticación, no necesitamos hacerlo aquí
      const { data: itineraries, error } = await supabase.from('itinerary').select('*')

      if (error) {
        console.error('Error al obtener datos:', error.message);
        setLoading(false);
        return;
      }

      setData(getNormalizedItineraries(itineraries));
      setLoading(false);
    }

    fetchData();
  }, []);

  // Crear las columnas de las tablas
  const columns: Column[] = [
    { name: 'Clave', uid: 'id', columnType: 'default', visible: false },
    { name: 'Título', uid: 'title', columnType: 'default', sortDirection: 'ascending', filterSearch: true },
    { name: 'Destino', uid: 'destination', columnType: 'default' },
    { name: 'Idioma', uid: 'language', columnType: 'default' },
    { name: 'Fecha de inicio', uid: 'start_date', columnType: 'date' },
    { name: 'Fecha de fin', uid: 'end_date', columnType: 'date' },
    { name: 'Estatus', uid: 'status', columnType: 'status' },
    { name: 'Fecha de creación', uid: 'created_at', columnType: 'date' },
    { name: 'Última modificación', uid: 'updated_at', columnType: 'date' },
    { name: 'Acciones', uid: 'actions', columnType: 'itinerary-actions' },
  ];

  // Función para manejar cambios en los datos
  const handleDataChange = (newData: any[]) => {
    setData(newData);
    setTableKey((prev) => prev + 1); // Incrementar key para forzar re-render
  };

  if (loading) 
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">Cargando Itinerarios</p>
        </div>
      </div>
    )

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section>
        <TableUI
          key={tableKey} // Key que cambia para forzar re-render
          columns={columns}
          data={data}
          title="Itinerarios"
          buttonsAdd={['Nuevo itinerario']}
          onDataChange={handleDataChange}
          deleteConfig={itineraryDeleteConfig}
          toggleStatusConfig={itineraryToggleStatusConfig}
        />
      </section>
    </main>
  );
}
