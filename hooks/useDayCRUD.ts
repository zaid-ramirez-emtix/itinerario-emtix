'use client'

import { DayInsert, DayWithActivities } from '@/types/itinerary'
import { 
  createDay as createDayService,
  updateDay as updateDayService,
  deleteDay as deleteDayService
} from '@/services/itinerary'
import { useState } from 'react'
import { toast } from 'sonner'

interface UseDayCRUDOptions {
  onSuccess?: (data: DayWithActivities) => void
  revalidatePath?: string
  revalidateFn?: (path: string) => void
}

export function useDayCRUD(options: UseDayCRUDOptions = {}) {
  const { onSuccess, revalidatePath, revalidateFn } = options
  const [isLoading, setIsLoading] = useState(false)

  // Función helper para manejar errores y loading para DayWithActivities
  const executeDayOperation = async (operation: () => Promise<DayWithActivities>): Promise<DayWithActivities | null> => {
    setIsLoading(true)
    try {
      const result = await operation()
      
      // Revalidar datos si se especifica
      if (revalidateFn && revalidatePath) {
        revalidateFn(revalidatePath)
      }
      
      // Callback de éxito
      if (result && onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error: any) {
      console.error('Error in day operation:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Crear día
  const createDay = async (data: DayInsert): Promise<DayWithActivities | null> => {
    return executeDayOperation(async () => {
      const result = await createDayService(data)
      toast.success('¡Día creado exitosamente!')
      return result
    })
  }

  // Actualizar día
  const updateDay = async (data: Partial<DayInsert>, id: string): Promise<DayWithActivities | null> => {
    return executeDayOperation(async () => {
      const result = await updateDayService(id, data)
      toast.success('¡Día actualizado exitosamente!')
      return result
    })
  }

  // Eliminar día
  const deleteDay = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      await deleteDayService(id)
      toast.success('¡Día eliminado exitosamente!')
      
      // Revalidar datos si se especifica
      if (revalidateFn && revalidatePath) {
        revalidateFn(revalidatePath)
      }
    } catch (error: any) {
      console.error('Error deleting day:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Alternar estado activo/inactivo del día
  const toggleDayActive = async (id: string, active: boolean): Promise<DayWithActivities | null> => {
    return executeDayOperation(async () => {
      // Usar updateDay para preservar las relaciones completas
      const result = await updateDayService(id, { active })
      toast.success(active ? 'Día activado correctamente' : 'Día desactivado correctamente')
      return result
    })
  }

  return {
    createDay,
    updateDay,
    deleteDay,
    toggleDayActive,
    isLoading
  }
}
