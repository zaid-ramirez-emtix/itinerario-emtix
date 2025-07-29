'use client'

import { useState, useCallback } from 'react'
import { Button, Input, Textarea } from '@heroui/react'
import { IconPlus, IconX, IconClock, IconLink } from '@tabler/icons-react'
import { toast } from 'sonner'
import { ActivityInsert } from '@/types/itinerary'
import { createActivity } from '@/services/itinerary'
import { ActivitySearchSelect } from '@/components/ui/activity-search-select'

interface AddActivityModalProps {
  dayId: string
  onActivityAdded: (activity: any) => void
  onClose: () => void
}

const activityTypes = [
  { key: 'Transporte', label: 'Transporte', icon: '🚗' },
  { key: 'Visita', label: 'Visita', icon: '🏛️' },
  { key: 'Gastronomía', label: 'Gastronomía', icon: '🍽️' },
  { key: 'Cultura', label: 'Cultura', icon: '🎨' },
  { key: 'Aventura', label: 'Aventura', icon: '🏔️' },
  { key: 'Relajación', label: 'Relajación', icon: '🧘' },
]

export function AddActivityModal({ dayId, onActivityAdded, onClose }: AddActivityModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    activity_type: '',
    transfer_time: '',
    activity_description: '',
    activity_link: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSelectChange = useCallback((selectedKey: string) => {
    handleInputChange('activity_type', selectedKey)
  }, [])

  const validateUrl = (url: string) => {
    if (!url) return true // URL es opcional
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.activity_type) {
      toast.error('Debes seleccionar un tipo de actividad')
      return
    }

    if (!formData.activity_description.trim()) {
      toast.error('La descripción es obligatoria')
      return
    }

    if (formData.activity_link && !validateUrl(formData.activity_link)) {
      toast.error('El enlace no tiene un formato válido')
      return
    }

    setIsLoading(true)

    try {
      const activityData: ActivityInsert = {
        id_day: dayId,
        activity_type: formData.activity_type,
        transfer_time: formData.transfer_time.trim() || '',
        activity_description: formData.activity_description.trim(),
        activity_link: formData.activity_link.trim() || '',
        active: true,
        order: 0 // Se calculará en el servicio
      }

      const newActivity = await createActivity(activityData)
      onActivityAdded(newActivity)
      toast.success('Actividad añadida correctamente')
      onClose()
    } catch (error) {
      console.error('Error adding activity:', error)
      toast.error('Error al añadir la actividad')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de actividad */}
        <div>
          <ActivitySearchSelect
            options={activityTypes}
            value={formData.activity_type}
            onSelectionChange={handleSelectChange}
            label="Tipo de actividad"
            placeholder="Buscar tipo de actividad..."
            isRequired
          />
        </div>

        {/* Descripción */}
        <div>
          <Textarea
            label="Descripción de la actividad"
            placeholder="Ej: Tour guiado por la Plaza Mayor con explicaciones históricas"
            value={formData.activity_description}
            onValueChange={(value) => handleInputChange('activity_description', value)}
            isRequired
            minRows={2}
            maxRows={4}
          />
        </div>

        {/* Tiempo de traslado */}
        <div>
          <Input
            label="Tiempo de traslado"
            placeholder="Ej: 30 min, 1 hora, 2h 15min"
            value={formData.transfer_time}
            onValueChange={(value) => handleInputChange('transfer_time', value)}
            startContent={<IconClock size={16} className="text-default-400" />}
          />
          <p className="text-small text-default-500 mt-1">
            Opcional - Tiempo estimado para llegar a esta actividad
          </p>
        </div>

        {/* Link */}
        <div>
          <Input
            label="Enlace de información"
            placeholder="https://ejemplo.com/actividad"
            value={formData.activity_link}
            onValueChange={(value) => handleInputChange('activity_link', value)}
            startContent={<IconLink size={16} className="text-default-400" />}
            type="url"
          />
          <p className="text-small text-default-500 mt-1">
            Opcional - Enlace con más información sobre la actividad
          </p>
        </div>

        {/* Preview del tipo seleccionado */}
        {formData.activity_type && (
          <div className="bg-default-50 rounded-lg p-3 border border-default-200">
            <p className="text-small text-default-600 mb-1">Vista previa:</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {activityTypes.find(t => t.key === formData.activity_type)?.icon}
              </span>
              <span className="font-medium text-foreground">
                {formData.activity_type}
              </span>
              {formData.transfer_time && (
                <span className="text-small text-default-500">
                  • {formData.transfer_time}
                </span>
              )}
            </div>
            {formData.activity_description && (
              <p className="text-small text-default-600 mt-2">
                {formData.activity_description}
              </p>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="light"
            onPress={onClose}
            className="flex-1"
            startContent={<IconX size={16} />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            className="flex-1"
            startContent={!isLoading && <IconPlus size={16} />}
          >
            {isLoading ? 'Añadiendo...' : 'Añadir Actividad'}
          </Button>
        </div>
      </form>
    </div>
  )
}
