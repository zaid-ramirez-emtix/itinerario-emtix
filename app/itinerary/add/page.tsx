'use client'

import ItineraryForm from '@/components/itinerary-form';
import { useRouter } from 'next/navigation';

export default function Add() {
  const router = useRouter();

  const handleSuccess = (data: any) => {
    // Redirigir a la página del itinerario o a la lista de itinerarios
    router.push('/'); // o donde quieras redirigir
  };

  return (
    <ItineraryForm 
      mode="create" 
      onSuccess={handleSuccess}
    />
  );
}