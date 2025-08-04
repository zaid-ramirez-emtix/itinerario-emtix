'use client'

import { Form, Input, Textarea, Button } from "@heroui/react";
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ActivityInsert, ActivityFormProps } from '@/types/itinerary';
import { IconClock, IconLink } from '@tabler/icons-react';
import { ActivitySearchSelect } from '@/components/ui/activity-search-select';
import { useActivityCRUD } from '@/hooks/useActivityCRUD';
import { useFormData } from '@/hooks/useFormData';

const activityTypes = [
  { key: 'AM', label: 'Mañana', icon: '🌅' },
  { key: 'PM', label: 'Tarde', icon: '🌇' },
  { key: 'BUS', label: 'Autobús', icon: '🚌' },
  { key: 'FLIGHT', label: 'Vuelo', icon: '✈️' },
  { key: 'DINNER', label: 'Cena/Comida', icon: '🍽️' },
  { key: 'SHOP', label: 'Compras', icon: '🛍️' },
];

export default function ActivityForm({ 
  initialData, 
  mode, 
  dayId,
  onSuccess, 
  onCancel 
}: ActivityFormProps) {
  const defaultFormData: ActivityInsert = useMemo(() => ({
    id_day: dayId || '',
    activity_type: '',
    transfer_time: '',
    activity_description: '',
    activity_link: '',
    active: true,
    order: 0
  }), [dayId]);

  // Limpiar initialData para excluir campos que no pertenecen a la tabla activity
  const cleanInitialData = useMemo(() => initialData ? {
    id_activity: initialData.id_activity,
    id_day: initialData.id_day,
    activity_type: initialData.activity_type,
    transfer_time: initialData.transfer_time,
    activity_description: initialData.activity_description,
    activity_link: initialData.activity_link,
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
  const { createActivity, updateActivity, isLoading } = useActivityCRUD({
    onSuccess,
    revalidatePath: `/itinerary/${dayId}`
  });

  const handleSelectChange = useCallback((selectedKey: string) => {
    handleInputChange('activity_type', selectedKey);
  }, [handleInputChange]);

  const validateUrl = (url: string) => {
    if (!url) return true; // URL es opcional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateActivity = (data: ActivityInsert) => {
    if (!data.activity_type) {
      toast.error('Debes seleccionar un tipo de actividad');
      return false;
    }

    if (!data.activity_description?.trim()) {
      toast.error('La descripción es obligatoria');
      return false;
    }

    if (data.activity_link && !validateUrl(data.activity_link)) {
      toast.error('El enlace no tiene un formato válido');
      return false;
    }

    if (!data.id_day) {
      toast.error('Error: ID de día no válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateActivity(formData)) {
        return;
      }

      console.log('FormData antes de enviar:', formData);

      // Ejecutar operación según el modo
      if (mode === 'create') {
        await createActivity(formData);
      } else {
        if (!initialData?.id_activity) {
          throw new Error('ID de la actividad es requerido para la actualización');
        }
        await updateActivity(formData, initialData.id_activity);
      }
    } catch (error: any) {
      console.error('Error al guardar actividad:', error);
      // El error ya se maneja en el hook useActivityCRUD
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {mode === 'create' ? 'Nueva Actividad' : 'Editar Actividad'}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {mode === 'create' 
            ? 'Completa el siguiente formulario para añadir una nueva actividad' 
            : 'Modifica los detalles de la actividad'
          }
        </p>
      </div>

      {/* Form Container */}
      <div>
        <Form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Tipo de actividad */}
          <ActivitySearchSelect
            isRequired
            options={activityTypes}
            value={formData.activity_type || ''}
            onSelectionChange={handleSelectChange}
            label="Tipo de actividad"
            placeholder="Buscar tipo de actividad..."
          />

          {/* Tiempo de traslado */}
          <Input
            isDisabled={isLoading}
            label="Tiempo de traslado"
            labelPlacement="outside"
            placeholder="Ej: 30 min, 2 horas, etc."
            value={formData.transfer_time || ''}
            onValueChange={(value) => handleInputChange('transfer_time', value)}
            startContent={<IconClock size={16} className="text-default-400" />}
            variant="bordered"
          />

          {/* Descripción */}
          <Textarea
            isRequired
            isDisabled={isLoading}
            label="Descripción de la actividad"
            labelPlacement="outside"
            placeholder="Ej: Visita guiada al museo de arte contemporáneo"
            value={formData.activity_description || ''}
            onValueChange={(value) => handleInputChange('activity_description', value)}
            minRows={2}
            maxRows={4}
            variant="bordered"
          />

          {/* Enlace */}
          <Input
            isDisabled={isLoading}
            label="Enlace relacionado (opcional)"
            labelPlacement="outside"
            placeholder="https://ejemplo.com"
            value={formData.activity_link || ''}
            onValueChange={(value) => handleInputChange('activity_link', value)}
            startContent={<IconLink size={16} className="text-default-400" />}
            variant="bordered"
            type="url"
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
                : (mode === 'create' ? 'Crear Actividad' : 'Actualizar Actividad')
              }
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
