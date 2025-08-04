import { useState } from 'react'
import { toast } from 'sonner'
import { DayWithActivities } from '@/types/itinerary'
import { getDaysWithActivities, updateDaysOrder } from '@/services/itinerary'
import { useDayCRUD } from './useDayCRUD'

/**
 * Hook para manejar todas las operaciones de días en el contexto de una lista
 * Maneja el estado de la lista completa y las operaciones de UI
 */
export function useDayOperations(itineraryId: string) {
  const [days, setDays] = useState<DayWithActivities[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Usar el hook CRUD para las operaciones de base de datos
  const { deleteDay, toggleDayActive } = useDayCRUD()

  // Función para cargar días desde Supabase
  const loadDays = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const daysData = await getDaysWithActivities(itineraryId)
      setDays(daysData)
    } catch (err) {
      console.error('Error loading days:', err)
      setError('Error al cargar los días del itinerario')
      toast.error('Error al cargar los días del itinerario')
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar orden de días
  const updateDaysOrderOperation = async (newDays: DayWithActivities[]) => {
    const oldDays = [...days]
    
    // Actualizar estado local inmediatamente
    setDays(newDays)
    
    try {
      const orderUpdates = newDays.map(day => ({
        id_day: day.id_day,
        order: day.order
      }))
      await updateDaysOrder(orderUpdates)
      toast.success('Orden de días actualizado')
    } catch (error) {
      console.error('Error updating days order:', error)
      toast.error('Error al actualizar el orden de los días')
      // Revertir cambios en caso de error
      setDays(oldDays)
    }
  }

  // Alternar estado activo/inactivo de un día
  const toggleDayActiveOperation = async (dayId: string, isActive: boolean) => {
    const oldDays = [...days]
    
    // Actualizar estado local inmediatamente
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === dayId 
          ? { ...day, active: isActive }
          : day
      )
    )
    
    try {
      const result = await toggleDayActive(dayId, isActive)
      // Si el resultado incluye datos completos, actualizar el estado con esos datos
      if (result) {
        setDays(prevDays => 
          prevDays.map(day => 
            day.id_day === dayId 
              ? result
              : day
          )
        )
      }
    } catch (error) {
      console.error('Error toggling day:', error)
      // Revertir cambios en caso de error
      setDays(oldDays)
    }
  }

  // Eliminar día
  const deleteDayOperation = async (dayId: string): Promise<boolean> => {
    try {
      await deleteDay(dayId)
      setDays(prevDays => prevDays.filter(day => day.id_day !== dayId))
      return true
    } catch (error) {
      console.error('Error deleting day:', error)
      return false
    }
  }

  // Añadir día
  const addDayOperation = (newDay: DayWithActivities) => {
    setDays(prevDays => [...prevDays, newDay])
  }

  // Actualizar día
  const updateDayOperation = (updatedDay: DayWithActivities) => {
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === updatedDay.id_day 
          ? updatedDay
          : day
      )
    )
  }

  return {
    days,
    setDays,
    isLoading,
    error,
    loadDays,
    updateDaysOrderOperation,
    toggleDayActiveOperation,
    deleteDayOperation,
    addDayOperation,
    updateDayOperation
  }
}
