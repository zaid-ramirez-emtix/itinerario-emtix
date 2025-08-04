'use client'

import { Form, Input, Button } from "@heroui/react";
import { useMemo } from 'react';
import InputImage from '@/components/formElements/InputImage';
import { useCityCRUD } from '../../hooks/useCityCRUD';
import { useCityValidation } from '../../hooks/useCityValidation';
import { useFormData } from '@/hooks/useFormData';
import { CityFormProps as CityFormPropsType, CityFormData } from '@/types/city';

interface CityInsert {
  city_name: string;
  city_image_path: string | null;
  active: boolean;
}

interface CityFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export default function CityForm({ 
  initialData, 
  mode, 
  onSuccess, 
  onCancel 
}: CityFormProps) {
  const defaultFormData: CityFormData = useMemo(() => ({
    city_name: '',
    city_image_path: null,
    active: true
  }), []);

  // Memorizar las opciones del hook para evitar bucles infinitos
  const formDataOptions = useMemo(() => ({
    initialData
  }), [initialData]);

  // Hooks personalizados
  const { formData, handleInputChange } = useFormData(
    defaultFormData,
    formDataOptions
  );

  const { createCity, updateCity, isLoading } = useCityCRUD({
    onSuccess,
    revalidatePath: '/cities'
  });
  
  const { validateCity } = useCityValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar formulario
      const validation = validateCity(formData);
      if (!validation.isValid) {
        return;
      }

      console.log('FormData antes de enviar:', formData);

      // Ejecutar operación según el modo
      if (mode === 'create') {
        await createCity(formData);
      } else {
        if (!initialData?.id_city) {
          throw new Error('ID de la ciudad es requerido para la actualización');
        }
        await updateCity(formData, initialData.id_city);
      }
    } catch (error: any) {
      console.error('Error detallado al guardar ciudad:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      // El error ya se maneja en el hook useCityCRUD
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {mode === 'create' ? 'Nueva Ciudad' : 'Editar Ciudad'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {mode === 'create' 
            ? 'Completa la información para agregar una nueva ciudad al catálogo.' 
            : 'Modifica la información de la ciudad seleccionada.'
          }
        </p>
      </div>

      {/* Form Section */}
      <Form 
        className="max-w-lg mx-auto space-y-6" 
        onSubmit={handleSubmit}
        validationBehavior="native"
      >
        {/* Nombre de la ciudad */}
        <Input
          name="city_name"
          label="Nombre de la ciudad"
          placeholder="Ingresa el nombre de la ciudad"
          value={formData.city_name}
          onChange={(e) => handleInputChange('city_name', e.target.value)}
          isRequired
          variant="bordered"
          className="mb-4"
          classNames={{
            input: "text-small",
            inputWrapper: "h-12"
          }}
        />

        {/* Imagen de la ciudad */}
        <div className="space-y-2">
          <InputImage
            required={true}
            inputTitle="Imagen de la ciudad"
            pathImg={formData.city_image_path || ''}
            keyObjectName="city_image_path"
            changeHandler={handleInputChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="flat"
            onPress={onCancel}
            className="flex-1"
            isDisabled={isLoading}
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            color="primary"
            className="flex-1"
            isLoading={isLoading}
          >
            {mode === 'create' ? 'Crear Ciudad' : 'Actualizar Ciudad'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
