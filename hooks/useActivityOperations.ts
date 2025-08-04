import { toast } from 'sonner'
import { Activity, DayWithActivities } from '@/types/itinerary'
import { updateActivitiesOrder } from '@/services/itinerary'
import { useActivityCRUD } from './useActivityCRUD'

/**
 * Hook para manejar todas las operaciones de actividades en el contexto de una lista
 * Maneja las operaciones de UI y actualización del estado de la lista de días
 */
export function useActivityOperations() {
  
  // Usar el hook CRUD para las operaciones de base de datos
  const { deleteActivity, toggleActivityActive } = useActivityCRUD()
  
  // Actualizar orden de actividades
  const updateActivitiesOrderOperation = async (
    dayId: string, 
    newActivities: Activity[], 
    days: DayWithActivities[], 
    setDays: React.Dispatch<React.SetStateAction<DayWithActivities[]>>
  ) => {
    const oldDays = [...days]
    
    // Actualizar estado local inmediatamente
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === dayId 
          ? { ...day, activities: newActivities }
          : day
      )
    )
    
    try {
      const orderUpdates = newActivities.map(activity => ({
        id_activity: activity.id_activity,
        order: activity.order
      }))
      await updateActivitiesOrder(orderUpdates)
    } catch (error) {
      console.error('Error updating activities order:', error)
      toast.error('Error al actualizar el orden de las actividades')
      // Revertir cambios en caso de error
      setDays(oldDays)
    }
  }

  // Alternar estado activo/inactivo de una actividad
  const toggleActivityActiveOperation = async (
    dayId: string, 
    activityId: string, 
    isActive: boolean,
    days: DayWithActivities[], 
    setDays: React.Dispatch<React.SetStateAction<DayWithActivities[]>>
  ) => {
    const oldDays = [...days]
    
    // Actualizar estado local inmediatamente
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === dayId 
          ? { 
              ...day, 
              activities: day.activities.map(activity =>
                activity.id_activity === activityId
                  ? { ...activity, active: isActive }
                  : activity
              )
            }
          : day
      )
    )
    
    try {
      const result = await toggleActivityActive(activityId, isActive)
      // Si el resultado incluye datos completos, actualizar el estado con esos datos
      if (result) {
        setDays(prevDays => 
          prevDays.map(day => 
            day.id_day === dayId 
              ? { 
                  ...day, 
                  activities: day.activities.map(activity =>
                    activity.id_activity === activityId
                      ? result
                      : activity
                  )
                }
              : day
          )
        )
      }
    } catch (error) {
      console.error('Error toggling activity:', error)
      // Revertir cambios en caso de error
      setDays(oldDays)
    }
  }

  // Eliminar actividad
  const deleteActivityOperation = async (
    dayId: string, 
    activityId: string,
    days: DayWithActivities[], 
    setDays: React.Dispatch<React.SetStateAction<DayWithActivities[]>>
  ): Promise<boolean> => {
    try {
      await deleteActivity(activityId)
      setDays(prevDays => 
        prevDays.map(day => 
          day.id_day === dayId 
            ? { 
                ...day, 
                activities: day.activities.filter(activity => activity.id_activity !== activityId)
              }
            : day
        )
      )
      return true
    } catch (error) {
      console.error('Error deleting activity:', error)
      return false
    }
  }

  // Añadir actividad
  const addActivityOperation = (
    dayId: string, 
    newActivity: Activity,
    days: DayWithActivities[], 
    setDays: React.Dispatch<React.SetStateAction<DayWithActivities[]>>
  ) => {
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === dayId 
          ? { 
              ...day, 
              activities: [...day.activities, newActivity]
            }
          : day
      )
    )
  }

  // Actualizar actividad
  const updateActivityOperation = (
    updatedActivity: Activity,
    days: DayWithActivities[], 
    setDays: React.Dispatch<React.SetStateAction<DayWithActivities[]>>
  ) => {
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === updatedActivity.id_day
          ? {
              ...day,
              activities: day.activities.map(activity =>
                activity.id_activity === updatedActivity.id_activity
                  ? updatedActivity
                  : activity
              )
            }
          : day
      )
    )
  }

  return {
    updateActivitiesOrderOperation,
    toggleActivityActiveOperation,
    deleteActivityOperation,
    addActivityOperation,
    updateActivityOperation
  }
}
