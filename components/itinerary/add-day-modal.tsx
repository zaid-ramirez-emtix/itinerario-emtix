'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea } from '@heroui/react'
import { IconPlus, IconX, IconHome, IconUpload, IconPhoto, IconBug } from '@tabler/icons-react'
import { toast } from 'sonner'
import { DayInsert, City, DayWithActivities } from '@/types/itinerary'
import { createDay, getCities } from '@/services/itinerary'
import { uploadImage, validateImageFile, resizeImageIfNeeded } from '@/services/images'
import { CitySearchSelect } from '../ui/city-search-select'

interface AddDayModalProps {
  itineraryId: string
  onDayAdded: (day: DayWithActivities) => void
  onClose: () => void
}

export function AddDayModal({ itineraryId, onDayAdded, onClose }: AddDayModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [cities, setCities] = useState<City[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [formData, setFormData] = useState({
    description: '',
    lodging_place: '',
    image_url: '',
    id_city: ''
  })

  // Cargar ciudades al montar el componente
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true)
        const citiesData = await getCities()
        setCities(citiesData)
      } catch(error) {
        console.error('Error loading cities', error)
        toast.error('Error al cargar las ciudades')
      } finally {
        setIsLoadingCities(false)
      }
    }

    loadCities()
  }, [])

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
      
      // Subir la imagen
      const imageUrl = await uploadImage(resizedFile, 'days')
      
      handleInputChange('image_url', imageUrl)
      toast.success('Imagen cargada correctamente')

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

    if (!itineraryId) {
      toast.error('Error: ID de itinerario no válido')
      console.error('Missing itineraryId:', itineraryId)
      return
    }

    setIsLoading(true)

    try {
      console.log('Creating day for itinerary:', itineraryId)
      
      const dayData: DayInsert = {
        id_itinerary: itineraryId,
        id_city: formData.id_city,
        day_description: formData.description.trim(),
        lodging_place: formData.lodging_place.trim() || '',
        image_path: formData.image_url || null,
        active: true,
        order: 0 // Se calculará en el servicio
      }

      console.log('Day data to create:', dayData)
      const newDay = await createDay(dayData)
      console.log('Day created successfully:', newDay)
      
      onDayAdded(newDay)
      toast.success('Día añadido correctamente')
      onClose()
    } catch (error: any) {
      console.error('Error adding day:', error)
      toast.error(error.message || 'Error al añadir el día')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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

        {/* Ciudad */}
        <div>
          <CitySearchSelect 
            options={cities.map(city => ({
              key: city.id_city?.toString(),
              label: city.city_name
            }))}
            value={formData.id_city}
            onSelectionChange={(value) => handleInputChange('id_city', value)}
            label='Ciudad'
            placeholder={isLoadingCities ? 'Cargando ciudades...' : 'Buscar ciudad...'}
            isDisabled={isLoadingCities}
          />
          {isLoadingCities && (
            <p className='text-xs text-default-500 mt-1'>Cargando ciudades...</p>
          )}
          {!isLoadingCities && cities.length === 0 && (
            <p className='text-xs text-warning mt-1'>No hay ciudades disponibles</p>
          )}
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
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
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
                        Click para seleccionar una imagen
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
                  onPress={() => {
                    handleInputChange('image_url', '')
                    toast.success('Imagen eliminada')
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
            startContent={!isLoading && <IconPlus size={16} />}
          >
            {isLoading ? 'Añadiendo...' : isUploadingImage ? 'Subiendo imagen...' : 'Añadir Día'}
          </Button>
        </div>
      </form>
    </div>
  )
}
