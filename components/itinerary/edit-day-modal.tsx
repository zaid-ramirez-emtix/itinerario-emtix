'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea } from '@heroui/react'
import { IconDeviceFloppy, IconX, IconHome, IconUpload, IconPhoto } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Day, DayInsert } from '@/types/itinerary'
import { updateDay } from '@/services/itinerary'
import { uploadImage, validateImageFile, resizeImageIfNeeded } from '@/services/images'
import { deleteImageFile, isOurUploadedImage } from '@/services/file-cleanup-client'

interface EditDayModalProps {
  day: Day
  onDayUpdated: (updatedDay: Day) => void
  onClose: () => void
}

export function EditDayModal({ day, onDayUpdated, onClose }: EditDayModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    lodging_place: '',
    image_url: ''
  })

  // Inicializar el formulario con los datos del día
  useEffect(() => {
    setFormData({
      description: day.day_description || '',
      lodging_place: day.lodging_place || '',
      image_url: day.image_path || ''
    })
  }, [day])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)

      // Validar el archivo
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        toast.error(validation.error || 'Archivo no válido')
        return
      }

      // Redimensionar si es necesario
      const resizedFile = await resizeImageIfNeeded(file, 800, 600, 0.8)
      
      // Subir la imagen (pasando la imagen anterior para eliminación automática)
      const imageUrl = await uploadImage(resizedFile, 'days', formData.image_url)
      
      handleInputChange('image_url', imageUrl)
      toast.success('Imagen actualizada correctamente')

    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Error al cargar la imagen')
    } finally {
      setIsUploadingImage(false)
      // Limpiar el input para permitir subir la misma imagen de nuevo
      event.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.description.trim()) {
      toast.error('La descripción es obligatoria')
      return
    }

    setIsLoading(true)

    try {
      console.log('Updating day:', day.id_day)
      
      const updateData: Partial<Omit<DayInsert, 'id_day' | 'created_at' | 'order'>> = {
        day_description: formData.description.trim(),
        lodging_place: formData.lodging_place.trim() || '',
        image_path: formData.image_url || '/api/placeholder/400/200',
      }

      console.log('Day data to update:', updateData)
      const updatedDay = await updateDay(day.id_day, updateData)
      console.log('Day updated successfully:', updatedDay)
      
      onDayUpdated(updatedDay)
      toast.success('Día actualizado correctamente')
      onClose()
    } catch (error: any) {
      console.error('Error updating day:', error)
      toast.error(error.message || 'Error al actualizar el día')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Editar Día {day.order}
        </h3>
        <p className="text-sm text-default-500">
          Modifica la información de este día del itinerario
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Descripción */}
        <div>
          <Textarea
            label="Descripción del día"
            placeholder="Ej: Exploración del centro histórico y visita a museos"
            value={formData.description}
            onValueChange={(value) => handleInputChange('description', value)}
            isRequired
            minRows={2}
            maxRows={4}
          />
        </div>

        {/* Lugar de alojamiento */}
        <div>
          <Input
            label="Lugar de alojamiento"
            placeholder="Ej: Hotel Marriott, Airbnb centro, etc."
            value={formData.lodging_place}
            onValueChange={(value) => handleInputChange('lodging_place', value)}
            startContent={<IconHome size={16} className="text-default-400" />}
          />
        </div>

        {/* Imagen del día */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Imagen del día
          </label>
          <div className="space-y-3">
            {/* Zona de subida */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                id="image-upload-edit"
              />
              <label
                htmlFor="image-upload-edit"
                className={`
                  flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg
                  transition-colors cursor-pointer
                  ${isUploadingImage 
                    ? 'border-primary-300 bg-primary-50 cursor-not-allowed' 
                    : 'border-default-300 hover:border-primary-400 hover:bg-default-50'
                  }
                `}
              >
                <div className="text-center">
                  {isUploadingImage ? (
                    <>
                      <IconUpload size={24} className="mx-auto mb-2 text-primary-500 animate-pulse" />
                      <p className="text-sm text-primary-600 font-medium">Subiendo imagen...</p>
                    </>
                  ) : (
                    <>
                      <IconPhoto size={24} className="mx-auto mb-2 text-default-400" />
                      <p className="text-sm text-foreground font-medium">
                        Click para cambiar la imagen
                      </p>
                      <p className="text-xs text-default-500 mt-1">
                        JPG, PNG o WebP (máx. 5MB)
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Preview de la imagen */}
            {formData.image_url && (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Preview del día"
                  className="w-full h-40 object-cover rounded-lg border border-default-200"
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="flat"
                  className="absolute top-2 right-2"
                  onPress={async () => {
                    const currentImageUrl = formData.image_url
                    
                    // Limpiar la imagen del estado primero
                    handleInputChange('image_url', '')
                    
                    // Si es una imagen subida por nosotros, eliminarla del servidor
                    if (currentImageUrl && isOurUploadedImage(currentImageUrl)) {
                      try {
                        const deleted = await deleteImageFile(currentImageUrl)
                        if (deleted) {
                          toast.success('Imagen eliminada del servidor')
                        } else {
                          toast.success('Imagen removida')
                        }
                      } catch (error) {
                        console.error('Error eliminando imagen:', error)
                        toast.success('Imagen removida (no se pudo eliminar del servidor)')
                      }
                    } else {
                      toast.success('Imagen removida')
                    }
                  }}
                >
                  <IconX size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="light"
            onPress={onClose}
            className="flex-1"
            startContent={<IconX size={16} />}
            isDisabled={isLoading || isUploadingImage}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            isDisabled={isUploadingImage}
            className="flex-1"
            startContent={!isLoading && <IconDeviceFloppy size={16} />}
          >
            {isLoading ? 'Guardando...' : isUploadingImage ? 'Subiendo imagen...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  )
}
