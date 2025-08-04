'use client'

import CityForm from './city-form';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface CityEditProps {
  id: string;
  onUpdate?: (updatedCity: any) => void;
  onClose?: () => void;
}

export default function CityEdit({ id, onUpdate, onClose }: CityEditProps) {
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const { data, error } = await supabase
          .from('city')
          .select('*')
          .eq('id_city', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            toast.error('Ciudad no encontrada');
            onClose?.();
            return;
          }
          throw error;
        }

        setCity(data);
      } catch (error: any) {
        console.error('Error al cargar ciudad:', error);
        toast.error('Error al cargar la ciudad');
        onClose?.();
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCity();
    }
  }, [id, supabase, onClose]);

  const handleSuccess = (updatedCity: any) => {
    toast.success('Ciudad actualizada exitosamente');
    onUpdate?.(updatedCity);
    onClose?.();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Cargando ciudad...</div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg text-red-500">Ciudad no encontrada</div>
      </div>
    );
  }

  return (
    <CityForm
      mode="edit"
      initialData={city}
      onSuccess={handleSuccess}
      onCancel={onClose}
    />
  );
}
