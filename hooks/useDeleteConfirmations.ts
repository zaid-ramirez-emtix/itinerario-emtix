import { DayWithActivities, Activity } from '@/types/itinerary'

export function useDeleteConfirmations(
  showConfirmModal: (
    title: string,
    message: string,
    onConfirm: () => void
  ) => void
) {
  const confirmDeleteDay = (
    day: DayWithActivities,
    onConfirm: () => Promise<void>
  ) => {
    const activityCount = day.activities.length

    showConfirmModal(
      'Eliminar día',
      `¿Estás seguro de que quieres eliminar este día permanentemente? ${
        activityCount > 0 
          ? `También se eliminarán ${activityCount} ${activityCount === 1 ? 'actividad' : 'actividades'}.` 
          : ''
      } Esta acción no se puede deshacer.`,
      () => onConfirm()
    )
  }

  const confirmDeleteActivity = (
    activity: Activity,
    onConfirm: () => Promise<void>
  ) => {
    showConfirmModal(
      'Eliminar actividad',
      `¿Estás seguro de que quieres eliminar la actividad "${activity.activity_description}" permanentemente? Esta acción no se puede deshacer.`,
      () => onConfirm()
    )
  }

  return {
    confirmDeleteDay,
    confirmDeleteActivity
  }
}
