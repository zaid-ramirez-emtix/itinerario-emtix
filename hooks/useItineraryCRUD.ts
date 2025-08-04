'use client'

import { ItineraryInsert } from '@/types/itinerary'
import { revalidateItinerary } from '@/components/itinerary/itinerary-server'
import { useGenericCRUD } from './useGenericCRUD'

interface UseItineraryCRUDOptions {
  onSuccess?: (data: any) => void
  revalidatePath?: string
}

export function useItineraryCRUD(options: UseItineraryCRUDOptions = {}) {
  const { create, update, remove, isLoading } = useGenericCRUD<any>({
    tableName: 'itinerary',
    idField: 'id_itinerary',
    onSuccess: options.onSuccess,
    revalidateFn: revalidateItinerary,
    revalidatePath: options.revalidatePath || '/itinerary',
    successMessages: {
      create: '¡Itinerario creado exitosamente!',
      update: '¡Itinerario actualizado exitosamente!',
      delete: '¡Itinerario eliminado exitosamente!'
    }
  })

  const createItinerary = (data: ItineraryInsert) => create(data)
  const updateItinerary = (data: ItineraryInsert, id: string) => update(data, id)
  const deleteItinerary = (id: string) => remove(id)

  return {
    createItinerary,
    updateItinerary,
    deleteItinerary,
    isLoading
  }
}
