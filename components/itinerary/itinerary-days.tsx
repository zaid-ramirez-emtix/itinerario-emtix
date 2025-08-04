import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Image, Spinner } from '@heroui/react'
import { IconGripVertical, IconClock, IconMapPin, IconExternalLink, IconPlus, IconEyeOff, IconEye, IconEdit, IconPhoto, IconTrash } from '@tabler/icons-react'
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
import ConfirmModal from "@/components/ui/confirm-modal"
import { useDayOperations } from '@/hooks/useDayOperations'
import { useActivityOperations } from '@/hooks/useActivityOperations'
import { useDeleteConfirmations } from '@/hooks/useDeleteConfirmations'
import { useConfirmationModal } from '@/hooks/useConfirmationModal'

interface SortableActivityProps {
  activity: Activity
  dayNumber: number
  onEditActivity: (activity: Activity) => void
  onToggleActivity: (activity: Activity, completed: boolean) => void
  onDeleteActivity: (activityId: string) => void
}

function SortableActivity({ activity, dayNumber, onEditActivity, onToggleActivity, onDeleteActivity }: SortableActivityProps) {
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
    switch (type.toUpperCase()) {
      case 'AM':
        return '🌅'
      case 'PM':
        return '🌇'
      case 'BUS':
        return '🚌'
      case 'FLIGHT':
        return '✈️'
      case 'DINNER':
        return '🍽️'
      case 'SHOP':
        return '🛍️'
      default:
        return '📍'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'AM':
        return 'warning'
      case 'PM':
        return 'primary'
      case 'BUS':
        return 'secondary'
      case 'FLIGHT':
        return 'danger'
      case 'DINNER':
        return 'success'
      case 'SHOP':
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
      } ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className={`text-default-400 hover:text-default-600 transition-colors mt-1 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
          }`}
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
                  onPress={() => onToggleActivity(activity, !activity.active)}
                  title={activity.active ? "Desactivar actividad" : "Activar actividad"}
                >
                  {activity.active ? <IconEyeOff size={14} /> : <IconEye size={14} />}
                </Button>
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  color="danger"
                  onPress={() => onDeleteActivity(activity.id_activity)}
                  title="Eliminar actividad permanentemente"
                >
                  <IconTrash size={14} />
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
  onDeleteDay: (dayId: string) => void
  onDeleteActivity: (dayId: string, activityId: string) => void
}

function SortableDay({ day, dayNumber, onUpdateActivities, onAddActivity, onEditDay, onEditActivity, onToggleDay, onToggleActivity, onDeleteDay, onDeleteActivity }: SortableDayProps) {
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
    // Agregar clase al body para cambiar cursor globalmente
    document.body.classList.add('dnd-active')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Remover clase del body
    document.body.classList.remove('dnd-active')

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
      className={`w-full ${!day.active ? 'opacity-60' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3 w-full">
          <div
            {...attributes}
            {...listeners}
            className={`text-default-400 hover:text-default-600 transition-colors mt-1 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
            }`}
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
                <Chip color="primary" variant="solid" size="sm">
                  📍 {day.city?.city_name || day.id_city}
                </Chip>
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
                <Button
                  size="sm"
                  isIconOnly
                  variant="light"
                  color="danger"
                  onPress={() => onDeleteDay(day.id_day)}
                  title="Eliminar día permanentemente"
                >
                  <IconTrash size={16} />
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
              {(day.image_path && !day.image_path.includes('/api/placeholder')) || day.city?.city_image_path ? (
                <Image
                  src={day.image_path && !day.image_path.includes('/api/placeholder') 
                    ? day.image_path 
                    : day.city?.city_image_path || ''}
                  alt={day.image_path && !day.image_path.includes('/api/placeholder') 
                    ? `Día ${dayNumber}` 
                    : `Ciudad ${day.city?.city_name || day.id_city}`}
                  className="w-full h-full object-cover"
                  fallbackSrc="/api/placeholder/400/200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-default-400">
                  <div className="text-center">
                    <IconPhoto size={32} className="mx-auto mb-2" />
                    <p className="text-sm">Sin imagen</p>
                  </div>
                </div>
              )}
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
                          onToggleActivity={(activity, isActive) => onToggleActivity(day.id_day, activity.id_activity, isActive)}
                          onDeleteActivity={(activityId) => onDeleteActivity(day.id_day, activityId)}
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
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Custom hooks
  const {
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
  } = useDayOperations(itineraryId)

  const {
    updateActivitiesOrderOperation,
    toggleActivityActiveOperation,
    deleteActivityOperation,
    addActivityOperation,
    updateActivityOperation
  } = useActivityOperations()

  // Hook para modal de confirmación
  const { confirmModal, showConfirmModal, closeModal } = useConfirmationModal();

  const { confirmDeleteDay, confirmDeleteActivity } = useDeleteConfirmations(
    // showConfirmModal compatible - no necesitamos closeModal ya que el nuevo hook lo maneja automáticamente
    (title: string, message: string, onConfirm: () => void) => {
      showConfirmModal(title, message, async () => {
        await onConfirm();
      });
    }
  );
  
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

  // Cargar días del itinerario desde Supabase
  useEffect(() => {
    if (itineraryId) {
      loadDays()
    }
  }, [itineraryId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    document.body.classList.add('dnd-active')
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    document.body.classList.remove('dnd-active')

    if (active.id !== over?.id) {
      const oldIndex = days.findIndex((day) => day.id_day === active.id)
      const newIndex = days.findIndex((day) => day.id_day === over?.id)
      
      const newDays = arrayMove(days, oldIndex, newIndex).map((day, index) => ({
        ...day,
        order: index + 1
      }))
      
      await updateDaysOrderOperation(newDays)
    }
    
    setActiveId(null)
  }

  // Handlers simplificados
  const handleUpdateActivities = (dayId: string, newActivities: Activity[]) => {
    updateActivitiesOrderOperation(dayId, newActivities, days, setDays)
  }

  const handleAddActivity = (dayId: string) => {
    setSelectedDayId(dayId)
    openAddActivity()
  }

  const handleActivityAdded = (dayId: string, newActivity: Activity) => {
    addActivityOperation(dayId, newActivity, days, setDays)
    closeAddActivity()
  }

  const handleDayAdded = (newDay: DayWithActivities) => {
    addDayOperation(newDay)
    closeAddDay()
  }

  const handleEditDay = (day: Day) => {
    setSelectedDayToEdit(day)
    openEditDay()
  }

  const handleDayUpdated = (updatedDay: DayWithActivities) => {
    updateDayOperation(updatedDay)
    closeEditDay()
    setSelectedDayToEdit(null)
  }

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivityToEdit(activity)
    openEditActivity()
  }

  const handleActivityUpdated = (updatedActivity: Activity) => {
    updateActivityOperation(updatedActivity, days, setDays)
    closeEditActivity()
    setSelectedActivityToEdit(null)
  }

  const handleToggleDay = (dayId: string, isActive: boolean) => {
    toggleDayActiveOperation(dayId, isActive)
  }

  const handleToggleActivity = (dayId: string, activityId: string, isActive: boolean) => {
    toggleActivityActiveOperation(dayId, activityId, isActive, days, setDays)
  }

  const handleDeleteDay = (dayId: string) => {
    const dayToDelete = days.find(day => day.id_day === dayId)
    if (!dayToDelete) return

    confirmDeleteDay(dayToDelete, async () => {
      await deleteDayOperation(dayId)
    })
  }

  const handleDeleteActivity = (dayId: string, activityId: string) => {
    const day = days.find(d => d.id_day === dayId)
    const activity = day?.activities.find(a => a.id_activity === activityId)
    
    if (!activity) return

    confirmDeleteActivity(activity, async () => {
      await deleteActivityOperation(dayId, activityId, days, setDays)
    })
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
                  onDeleteDay={handleDeleteDay}
                  onDeleteActivity={handleDeleteActivity}
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

      {/* Modal de confirmación */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        isLoading={confirmModal.isLoading}
      />
    </div>
  )
}
