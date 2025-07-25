import { DragOverlay } from '@dnd-kit/core'
import { Card, CardBody, Chip } from '@heroui/react'
import { IconGripVertical } from '@tabler/icons-react'
import { DayWithActivities, Activity } from '@/types/itinerary'

interface DragOverlayContentProps {
  activeId: string | null
  days: DayWithActivities[]
}

export function DragOverlayContent({ activeId, days }: DragOverlayContentProps) {
  if (!activeId) return null

  // Buscar si es un día
  const day = days.find(d => d.id_day === activeId)
  if (day) {
    return (
      <DragOverlay>
        <Card className="w-full opacity-90 shadow-lg">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <IconGripVertical size={20} className="text-default-400" />
              <Chip color="primary" variant="solid" size="sm">
                Día {day.order}
              </Chip>
              <span className="text-lg font-semibold">{day.day_description}</span>
            </div>
          </CardBody>
        </Card>
      </DragOverlay>
    )
  }

  // Buscar si es una actividad
  for (const dayItem of days) {
    const activity = dayItem.activities.find(a => a.id_activity === activeId)
    if (activity) {
      return (
        <DragOverlay>
          <div className="bg-default-50 rounded-lg p-4 border border-default-200 opacity-90 shadow-lg">
            <div className="flex items-center gap-3">
              <IconGripVertical size={16} className="text-default-400" />
              <Chip color="secondary" variant="flat" size="sm">
                {activity.activity_type}
              </Chip>
              <span className="text-sm">{activity.activity_description}</span>
            </div>
          </div>
        </DragOverlay>
      )
    }
  }

  return null
}
