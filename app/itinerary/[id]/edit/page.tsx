'use client'

import ItineraryForm from '@/components/itinerary-form';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function EditItinerary() {
  const router = useRouter();
  const params = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        // const { data: { user } } = await supabase.auth.getUser();
        
        // if (!user) {
        //   toast.error('Debes estar autenticado');
        //   router.push('/login');
        //   return;
        // }

        const { data, error } = await supabase
          .from('itinerary')
          .select('*')
          .eq('id_itinerary', params.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            toast.error('Itinerario no encontrado');
            router.push('/');
            return;
          }
          throw error;
        }

        setItinerary(data);
      } catch (error: any) {
        console.error('Error al cargar itinerario:', error);
        toast.error('Error al cargar el itinerario');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchItinerary();
    }
  }, [params.id, router, supabase]);

  const handleSuccess = () => {
    params.id 
    ? router.push(`/itinerary/${params.id}`)
    : router.push('/');
  };

  const handleCancel = () => {
    params.id 
    ? router.push(`/itinerary/${params.id}`)
    : router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando itinerario...</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return null; // El useEffect ya maneja la redirección
  }

  return (
    <ItineraryForm 
      mode="edit" 
      initialData={itinerary}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
