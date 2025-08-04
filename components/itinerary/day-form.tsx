'use client'

import { Form, Input, Textarea, Button } from "@heroui/react";
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { DayInsert, DayFormProps, City } from '@/types/itinerary';
import { getCities } from '@/services/itinerary';
import { CitySearchSelect } from '@/components/ui/city-search-select';
import { IconHome } from '@tabler/icons-react';
import InputImage from '@/components/formElements/InputImage';
import { useDayCRUD } from '@/hooks/useDayCRUD';
import { useFormData } from '@/hooks/useFormData';

export default function DayForm({ 
  initialData, 
  mode, 
  itineraryId,
  onSuccess, 
  onCancel 
}: DayFormProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  const defaultFormData: DayInsert = useMemo(() => ({
    id_itinerary: itineraryId || '',
    id_city: '',
    day_description: '',
    lodging_place: '',
    image_path: '',
    active: true,
    order: 0
  }), [itineraryId]);

  // Limpiar initialData para excluir campos que no pertenecen a la tabla day
  const cleanInitialData = useMemo(() => initialData ? {
    id_day: initialData.id_day,
    id_itinerary: initialData.id_itinerary,
    id_city: initialData.id_city,
    day_description: initialData.day_description,
    lodging_place: initialData.lodging_place,
    image_path: initialData.image_path,
    active: initialData.active,
    order: initialData.order,
    created_at: initialData.created_at,
    updated_at: initialData.updated_at
  } : null, [initialData]);

  // Memorizar las opciones del hook para evitar bucles infinitos
  const formDataOptions = useMemo(() => ({
    initialData: cleanInitialData
  }), [cleanInitialData]);

  // Hooks personalizados
  const { formData, handleInputChange } = useFormData(defaultFormData, formDataOptions);
  const { createDay, updateDay, isLoading } = useDayCRUD({
    onSuccess,
    revalidatePath: `/itinerary/${itineraryId}`
  });

  // Cargar ciudades al montar el componente
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true);
        const citiesData = await getCities();
        setCities(citiesData);
      } catch(error) {
        console.error('Error loading cities', error);
        toast.error('Error al cargar las ciudades');
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  const validateDay = (data: DayInsert) => {
    if (!data.day_description?.trim()) {
      toast.error('La descripción es obligatoria');
      return false;
    }

    if (!data.id_city) {
      toast.error('La ciudad es obligatoria');
      return false;
    }

    if (!data.id_itinerary) {
      toast.error('Error: ID de itinerario no válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateDay(formData)) {
        return;
      }

      console.log('FormData antes de enviar:', formData);

      // Ejecutar operación según el modo
      if (mode === 'create') {
        await createDay(formData);
      } else {
        if (!initialData?.id_day) {
          throw new Error('ID del día es requerido para la actualización');
        }
        await updateDay(formData, initialData.id_day);
      }
    } catch (error: any) {
      console.error('Error al guardar día:', error);
      // El error ya se maneja en el hook useDayCRUD
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {mode === 'create' ? 'Nuevo Día' : 'Editar Día'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {mode === 'create' 
            ? 'Completa el siguiente formulario para añadir un nuevo día' 
            : 'Modifica los detalles del día'
          }
        </p>
      </div>

      {/* Form Container */}
      <div>
        <Form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Descripción */}
          <Textarea
            isRequired
            isDisabled={isLoading}
            label="Descripción del día"
            labelPlacement="outside"
            placeholder="Ej: Exploración del centro histórico y visita a museos"
            value={formData.day_description || ''}
            onValueChange={(value) => handleInputChange('day_description', value)}
            minRows={2}
            maxRows={4}
            variant="bordered"
          />

          {/* Lugar de alojamiento */}
          <Input
            isDisabled={isLoading}
            label="Lugar de alojamiento"
            labelPlacement="outside"
            placeholder="Ej: Hotel Marriott, Airbnb centro, etc."
            value={formData.lodging_place || ''}
            onValueChange={(value) => handleInputChange('lodging_place', value)}
            startContent={<IconHome size={16} className="text-default-400" />}
            variant="bordered"
          />

          {/* Ciudad */}
          <CitySearchSelect 
            options={cities.map(city => ({
              key: city.id_city?.toString(),
              label: city.city_name
            }))}
            value={formData.id_city || ''}
            onSelectionChange={(value) => handleInputChange('id_city', value)}
            label='Ciudad'
            placeholder={isLoadingCities ? 'Cargando ciudades...' : 'Buscar ciudad...'}
            isDisabled={isLoadingCities || isLoading}
            isRequired={true}
          />
          {isLoadingCities && (
            <p className='text-xs text-default-500 mt-1'>Cargando ciudades...</p>
          )}
          {!isLoadingCities && cities.length === 0 && (
            <p className='text-xs text-warning mt-1'>No hay ciudades disponibles</p>
          )}
          
          {/* Imagen del día */}
          <InputImage
            required={false}
            inputTitle="Imagen del día"
            pathImg={formData.image_path || ''}
            keyObjectName="image_path"
            changeHandler={handleInputChange}
          />

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button 
                type="button"
                variant="bordered"
                size="md"
                className="px-6"
                isDisabled={isLoading}
                onPress={onCancel}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              color="primary"
              size="md"
              className="px-8"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading 
                ? (mode === 'create' ? 'Creando...' : 'Actualizando...') 
                : (mode === 'create' ? 'Crear Día' : 'Actualizar Día')
              }
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
