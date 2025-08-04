'use client'

import { Activity, ActivityInsert } from '@/types/itinerary'
import { 
  createActivity as createActivityService,
  updateActivity as updateActivityService,
  deleteActivity as deleteActivityService
} from '@/services/itinerary'
import { useState } from 'react'
import { toast } from 'sonner'

interface UseActivityCRUDOptions {
  onSuccess?: (data: Activity) => void
  revalidatePath?: string
  revalidateFn?: (path: string) => void
}

export function useActivityCRUD(options: UseActivityCRUDOptions = {}) {
  const { onSuccess, revalidatePath, revalidateFn } = options
  const [isLoading, setIsLoading] = useState(false)

  // Función helper para manejar errores y loading para Activity
  const executeActivityOperation = async (operation: () => Promise<Activity>): Promise<Activity | null> => {
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
      console.error('Error in activity operation:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Crear actividad
  const createActivity = async (data: ActivityInsert): Promise<Activity | null> => {
    return executeActivityOperation(async () => {
      const result = await createActivityService(data)
      toast.success('¡Actividad creada exitosamente!')
      return result
    })
  }

  // Actualizar actividad
  const updateActivity = async (data: Partial<ActivityInsert>, id: string): Promise<Activity | null> => {
    return executeActivityOperation(async () => {
      const result = await updateActivityService(id, data)
      toast.success('¡Actividad actualizada exitosamente!')
      return result
    })
  }

  // Eliminar actividad
  const deleteActivity = async (id: string): Promise<void> => {
    setIsLoading(true)
    try {
      await deleteActivityService(id)
      toast.success('¡Actividad eliminada exitosamente!')
      
      // Revalidar datos si se especifica
      if (revalidateFn && revalidatePath) {
        revalidateFn(revalidatePath)
      }
    } catch (error: any) {
      console.error('Error deleting activity:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Alternar estado activo/inactivo de la actividad
  const toggleActivityActive = async (id: string, active: boolean): Promise<Activity | null> => {
    return executeActivityOperation(async () => {
      // Usar updateActivity para mantener consistencia
      const result = await updateActivityService(id, { active })
      toast.success(active ? 'Actividad activada correctamente' : 'Actividad desactivada correctamente')
      return result
    })
  }

  return {
    createActivity,
    updateActivity,
    deleteActivity,
    toggleActivityActive,
    isLoading
  }
}
