'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Image, Spinner } from '@heroui/react'
import { IconGripVertical, IconClock, IconMapPin, IconExternalLink, IconPlus, IconEyeOff, IconEye, IconEdit } from '@tabler/icons-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DayWithActivities, Activity, Day } from '@/types/itinerary'
import { DragOverlayContent } from './drag-overlay'
import { AddDayModal } from './add-day-modal'
import { EditDayModal } from './edit-day-modal'
import { AddActivityModal } from './add-activity-modal'
import { EditActivityModal } from './edit-activity-modal'
import { Modal, useModal } from "@/components/ui/modal"
import { toast } from 'sonner'
import {
  getDaysWithActivities,
  updateDaysOrder,
  updateActivitiesOrder,
  toggleDayActive,
  toggleActivityActive
} from '@/services/itinerary'

interface SortableActivityProps {
  activity: Activity
  dayNumber: number
  onEditActivity: (activity: Activity) => void
  onToggleActivity: (activityId: string, isActive: boolean) => void
}

function SortableActivity({ activity, dayNumber, onEditActivity, onToggleActivity }: SortableActivityProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id_activity })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'transporte':
        return '🚗'
      case 'visita':
        return '🏛️'
      case 'gastronomía':
        return '🍽️'
      case 'cultura':
        return '🎨'
      case 'aventura':
        return '🏔️'
      case 'relajación':
        return '🧘'
      default:
        return '📍'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'transporte':
        return 'warning'
      case 'visita':
        return 'primary'
      case 'gastronomía':
        return 'secondary'
      case 'cultura':
        return 'success'
      case 'aventura':
        return 'danger'
      case 'relajación':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-default-50 rounded-lg p-4 border border-default-200 hover:border-default-300 transition-colors ${
        !activity.active ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-default-400 hover:text-default-600 transition-colors mt-1"
        >
          <IconGripVertical size={16} />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getActivityIcon(activity.activity_type)}</span>
              <Chip
                color={getActivityColor(activity.activity_type) as any}
                variant="flat"
                size="sm"
              >
                {activity.activity_type}
              </Chip>
              {!activity.active && (
                <Chip color="danger" variant="flat" size="sm">
                  Inactiva
                </Chip>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activity.transfer_time && activity.transfer_time.trim() && (
                <div className="flex items-center gap-1 text-small text-default-500">
                  <IconClock size={14} />
                  {activity.transfer_time}
                </div>
              )}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  color="primary"
                  onPress={() => onEditActivity(activity)}
                  title="Editar actividad"
                >
                  <IconEdit size={14} />
                </Button>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  color={activity.active ? "warning" : "success"}
                  onPress={() => onToggleActivity(activity.id_activity, !activity.active)}
                  title={activity.active ? "Desactivar actividad" : "Activar actividad"}
                >
                  {activity.active ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                </Button>
              </div>
            </div>
          </div>
          
          <p className={`text-foreground ${!activity.active ? 'line-through' : ''}`}>
            {activity.activity_description}
          </p>
          
          {activity.activity_link && activity.active && (
            <Button
              as="a"
              href={activity.activity_link}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="light"
              color="primary"
              startContent={<IconExternalLink size={14} />}
              className="w-fit"
            >
              Ver más información
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface SortableDayProps {
  day: DayWithActivities
  dayNumber: number
  onUpdateActivities: (dayId: string, newActivities: Activity[]) => void
  onAddActivity: (dayId: string) => void
  onEditDay: (day: Day) => void
  onEditActivity: (activity: Activity) => void
  onToggleDay: (dayId: string, isActive: boolean) => void
  onToggleActivity: (dayId: string, activityId: string, isActive: boolean) => void
}

function SortableDay({ day, dayNumber, onUpdateActivities, onAddActivity, onEditDay, onEditActivity, onToggleDay, onToggleActivity }: SortableDayProps) {
  const [activities, setActivities] = useState(day.activities || [])
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null)
  
  // Sincronizar actividades cuando cambie el día
  useEffect(() => {
    setActivities(day.activities || [])
  }, [day.activities])
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day.id_day })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleActivityDragStart = (event: DragStartEvent) => {
    setActiveActivityId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = activities.findIndex((activity) => activity.id_activity === active.id)
      const newIndex = activities.findIndex((activity) => activity.id_activity === over?.id)
      
      const newActivities = arrayMove(activities, oldIndex, newIndex).map((activity, index) => ({
        ...activity,
        order: index + 1
      }))
      
      setActivities(newActivities)
      onUpdateActivities(day.id_day, newActivities)
    }
    
    setActiveActivityId(null)
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`w-full ${!day.active ? 'opacity-60' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 w-full">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-default-400 hover:text-default-600 transition-colors mt-1"
          >
            <IconGripVertical size={20} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Chip color="primary" variant="solid" size="sm">
                  Día {dayNumber}
                </Chip>
                {!day.active && (
                  <Chip color="danger" variant="flat" size="sm">
                    Inactivo
                  </Chip>
                )}
                {day.lodging_place && (
                  <div className="flex items-center gap-1 text-small text-default-500">
                    <IconMapPin size={14} />
                    {day.lodging_place}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  color="primary"
                  onPress={() => onEditDay(day)}
                  title="Editar día"
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  color={day.active ? "warning" : "success"}
                  onPress={() => onToggleDay(day.id_day, !day.active)}
                  title={day.active ? "Desactivar día" : "Activar día"}
                >
                  {day.active ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </Button>
              </div>
            </div>
            <h3 className={`text-lg font-semibold text-foreground mb-1 ${!day.active ? 'line-through' : ''}`}>
              {day.day_description}
            </h3>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-1">
            <div className="aspect-video rounded-lg overflow-hidden bg-default-200">
              <Image
                src={day.image_path || undefined}
                alt={`Día ${dayNumber}`}
                className="w-full h-full object-cover"
                fallbackSrc="/api/placeholder/400/200"
              />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">
                  Actividades del día ({activities.filter(a => a.active).length}/{activities.length})
                </h4>
                <Button
                  size="sm"
                  color="primary"
                  variant="light"
                  startContent={<IconPlus size={14} />}
                  onPress={() => onAddActivity(day.id_day)}
                  isDisabled={!day.active}
                >
                  Añadir actividad
                </Button>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleActivityDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activities.map(a => a.id_activity)}
                  strategy={verticalListSortingStrategy}
                >
                  {activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <SortableActivity
                          key={activity.id_activity}
                          activity={activity}
                          dayNumber={dayNumber}
                          onEditActivity={onEditActivity}
                          onToggleActivity={(activityId, isActive) => onToggleActivity(day.id_day, activityId, isActive)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-default-50 rounded-lg border-2 border-dashed border-default-200">
                      <p className="text-default-500 mb-2">No hay actividades para este día</p>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<IconPlus size={14} />}
                        onPress={() => onAddActivity(day.id_day)}
                      >
                        Añadir primera actividad
                      </Button>
                    </div>
                  )}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

interface ItineraryDaysProps {
  itineraryId: string
}

export function ItineraryDays({ itineraryId }: ItineraryDaysProps) {
  const [days, setDays] = useState<DayWithActivities[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Modales
  const { isOpen: isAddDayOpen, openModal: openAddDay, closeModal: closeAddDay } = useModal()
  const { isOpen: isAddActivityOpen, openModal: openAddActivity, closeModal: closeAddActivity } = useModal()
  const { isOpen: isEditDayOpen, openModal: openEditDay, closeModal: closeEditDay } = useModal()
  const { isOpen: isEditActivityOpen, openModal: openEditActivity, closeModal: closeEditActivity } = useModal()
  const [selectedDayId, setSelectedDayId] = useState<string>('')
  const [selectedDayToEdit, setSelectedDayToEdit] = useState<Day | null>(null)
  const [selectedActivityToEdit, setSelectedActivityToEdit] = useState<Activity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  // Cargar días del itinerario desde Supabase
  useEffect(() => {
    if (itineraryId) {
      loadDays()
    }
  }, [itineraryId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = days.findIndex((day) => day.id_day === active.id)
      const newIndex = days.findIndex((day) => day.id_day === over?.id)
      
      const newDays = arrayMove(days, oldIndex, newIndex).map((day, index) => ({
        ...day,
        order: index + 1
      }))
      
      // Actualizar estado local inmediatamente
      setDays(newDays)
      
      // Actualizar en Supabase
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
        const daysData = await getDaysWithActivities(itineraryId)
        setDays(daysData)
      }
    }
    
    setActiveId(null)
  }

  const handleUpdateActivities = async (dayId: string, newActivities: Activity[]) => {
    // Actualizar estado local inmediatamente
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === dayId 
          ? { ...day, activities: newActivities }
          : day
      )
    )
    
    // Actualizar orden en Supabase
    try {
      const orderUpdates = newActivities.map(activity => ({
        id_activity: activity.id_activity,
        order: activity.order
      }))
      await updateActivitiesOrder(orderUpdates)
    } catch (error) {
      console.error('Error updating activities order:', error)
      toast.error('Error al actualizar el orden de las actividades')
      // Recargar datos en caso de error
      const daysData = await getDaysWithActivities(itineraryId)
      setDays(daysData)
    }
  }

  const handleAddActivity = (dayId: string) => {
    setSelectedDayId(dayId)
    openAddActivity()
  }

  const handleActivityAdded = (dayId: string, newActivity: Activity) => {
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
    closeAddActivity()
  }

  const handleDayAdded = async (newDay: Day) => {
    try {
      // Convertir Day a DayWithActivities agregando array vacío de actividades
      const dayWithActivities: DayWithActivities = {
        ...newDay,
        activities: []
      }
      setDays(prevDays => [...prevDays, dayWithActivities])
      closeAddDay()
      
      // Opcional: recargar datos para asegurar sincronización
      // await loadDays()
    } catch (error) {
      console.error('Error handling day added:', error)
      // En caso de error, recargar todos los datos
      await loadDays()
    }
  }

  const handleEditDay = (day: Day) => {
    setSelectedDayToEdit(day)
    openEditDay()
  }

  const handleDayUpdated = async (updatedDay: Day) => {
    try {
      // Actualizar el día en el estado local
      setDays(prevDays => 
        prevDays.map(day => 
          day.id_day === updatedDay.id_day 
            ? { ...day, ...updatedDay }
            : day
        )
      )
      closeEditDay()
      setSelectedDayToEdit(null)
      
      // Opcional: recargar datos para asegurar sincronización
      // await loadDays()
    } catch (error) {
      console.error('Error handling day updated:', error)
      // En caso de error, recargar todos los datos
      await loadDays()
    }
  }

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivityToEdit(activity)
    openEditActivity()
  }

  const handleActivityUpdated = async (updatedActivity: Activity) => {
    try {
      // Actualizar la actividad en el estado local
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
      closeEditActivity()
      setSelectedActivityToEdit(null)
      
      // Opcional: recargar datos para asegurar sincronización
      // await loadDays()
    } catch (error) {
      console.error('Error handling activity updated:', error)
      // En caso de error, recargar todos los datos
      await loadDays()
    }
  }

  const handleToggleDay = async (dayId: string, isActive: boolean) => {
    // Actualizar estado local inmediatamente
    setDays(prevDays => 
      prevDays.map(day => 
        day.id_day === dayId 
          ? { ...day, active: isActive }
          : day
      )
    )
    
    try {
      await toggleDayActive(dayId, isActive)
      toast.success(isActive ? 'Día activado correctamente' : 'Día desactivado correctamente')
    } catch (error) {
      console.error('Error toggling day:', error)
      toast.error('Error al cambiar el estado del día')
      // Revertir cambios en caso de error
      const daysData = await getDaysWithActivities(itineraryId)
      setDays(daysData)
    }
  }

  const handleToggleActivity = async (dayId: string, activityId: string, isActive: boolean) => {
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
      await toggleActivityActive(activityId, isActive)
      toast.success(isActive ? 'Actividad activada correctamente' : 'Actividad desactivada correctamente')
    } catch (error) {
      console.error('Error toggling activity:', error)
      toast.error('Error al cambiar el estado de la actividad')
      // Revertir cambios en caso de error
      const daysData = await getDaysWithActivities(itineraryId)
      setDays(daysData)
    }
  }

  // Estados de carga y error
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">Cargando días del itinerario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="text-6xl">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error al cargar los días
            </h3>
            <p className="text-default-500 mb-4">{error}</p>
            <Button
              color="primary"
              variant="flat"
              onPress={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Días del itinerario
          </h2>
          <p className="text-default-500 mt-1">
            Arrastra los días y actividades para reordenarlos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Chip color="secondary" variant="flat">
            {days.filter(d => d.active).length}/{days.length} {days.length === 1 ? 'día activo' : 'días activos'}
          </Chip>
          <Button
            color="primary"
            startContent={<IconPlus size={16} />}
            onPress={openAddDay}
          >
            Añadir día
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={days.map(d => d.id_day)}
          strategy={verticalListSortingStrategy}
        >
          {days.length > 0 ? (
            <div className="space-y-6">
              {days.map((day, index) => (
                <SortableDay
                  key={day.id_day}
                  day={day}
                  dayNumber={index + 1}
                  onUpdateActivities={handleUpdateActivities}
                  onAddActivity={handleAddActivity}
                  onEditDay={handleEditDay}
                  onEditActivity={handleEditActivity}
                  onToggleDay={handleToggleDay}
                  onToggleActivity={handleToggleActivity}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-default-50 rounded-lg border-2 border-dashed border-default-200">
              <div className="space-y-4">
                <div className="text-6xl">🗓️</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No hay días en este itinerario
                  </h3>
                  <p className="text-default-500 mb-4">
                    Comienza añadiendo el primer día de tu viaje
                  </p>
                  <Button
                    color="primary"
                    size="lg"
                    startContent={<IconPlus size={20} />}
                    onPress={openAddDay}
                  >
                    Añadir primer día
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SortableContext>
        
        <DragOverlayContent activeId={activeId} days={days} />
      </DndContext>

      {/* Modal para añadir día */}
      <Modal
        isOpen={isAddDayOpen}
        onClose={closeAddDay}
        title="Añadir nuevo día"
        size="lg"
      >
        <AddDayModal
          itineraryId={itineraryId}
          onDayAdded={handleDayAdded}
          onClose={closeAddDay}
        />
      </Modal>

      {/* Modal para añadir actividad */}
      <Modal
        isOpen={isAddActivityOpen}
        onClose={closeAddActivity}
        title="Añadir nueva actividad"
        size="lg"
      >
        <AddActivityModal
          dayId={selectedDayId}
          onActivityAdded={(activity) => handleActivityAdded(selectedDayId, activity)}
          onClose={closeAddActivity}
        />
      </Modal>

      {/* Modal para editar día */}
      <Modal
        isOpen={isEditDayOpen}
        onClose={() => {
          closeEditDay()
          setSelectedDayToEdit(null)
        }}
        title="Editar día"
        size="lg"
      >
        {selectedDayToEdit && (
          <EditDayModal
            day={selectedDayToEdit}
            onDayUpdated={handleDayUpdated}
            onClose={() => {
              closeEditDay()
              setSelectedDayToEdit(null)
            }}
          />
        )}
      </Modal>

      {/* Modal para editar actividad */}
      <Modal
        isOpen={isEditActivityOpen}
        onClose={() => {
          closeEditActivity()
          setSelectedActivityToEdit(null)
        }}
        title="Editar actividad"
        size="lg"
      >
        {selectedActivityToEdit && (
          <EditActivityModal
            activity={selectedActivityToEdit}
            onActivityUpdated={handleActivityUpdated}
            onClose={() => {
              closeEditActivity()
              setSelectedActivityToEdit(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
