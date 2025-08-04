'use client'

import { Form, Input, Button } from "@heroui/react";
import { DatePicker } from "@heroui/react";
import { useMemo } from 'react';
import { ItineraryInsert, ItineraryFormProps } from '@/types/itinerary';
import { LanguageSearchSelect } from '@/components/ui/language-search-select'
import { ThemeSearchSelect } from '@/components/ui/theme-search-select';
import { I18nProvider } from "@react-aria/i18n";
import InputImage from '@/components/formElements/InputImage';
import { useItineraryCRUD } from '@/hooks/useItineraryCRUD';
import { useItineraryValidation } from '@/hooks/useItineraryValidation';
import { useFormData } from '@/hooks/useFormData';

export default function ItineraryForm({ 
  initialData, 
  mode, 
  onSuccess, 
  onCancel 
}: ItineraryFormProps) {
  const defaultFormData: ItineraryInsert = useMemo(() => ({
    title: '',
    destination: '',
    language: '',
    start_date: '',
    end_date: '',
    path_img_back: '',
    path_img_client: '',
    path_img_fair: '',
    path_img_front: '',
    path_itinerary_image: '',
    id_theme: '',
    active: true
  }), []);

  // Memorizar las opciones del hook para evitar bucles infinitos
  const formDataOptions = useMemo(() => ({
    initialData,
    dateFields: [
      { field: 'start_date' as const, stateField: 'startDate' },
      { field: 'end_date' as const, stateField: 'endDate' }
    ]
  }), [initialData]);

  // Hooks personalizados
  const { formData, handleInputChange, handleDateChange, getDateState } = useFormData(
    defaultFormData,
    formDataOptions
  );

  const { createItinerary, updateItinerary, isLoading } = useItineraryCRUD({
    onSuccess,
    revalidatePath: '/itinerary'
  });
  
  const { validateItinerary } = useItineraryValidation();

  const languages = [
    { key: "es", label: "Español" },
    { key: "en", label: "English" },
  ];

  // Efecto para inicializar los datos cuando se reciben initialData
  // Este useEffect ya no es necesario porque se maneja en useFormData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar formulario
      const validation = validateItinerary(formData);
      if (!validation.isValid) {
        return;
      }

      console.log('FormData antes de enviar:', formData);

      // Ejecutar operación según el modo
      if (mode === 'create') {
        await createItinerary(formData);
      } else {
        if (!initialData?.id_itinerary) {
          throw new Error('ID del itinerario es requerido para la actualización');
        }
        await updateItinerary(formData, initialData.id_itinerary);
      }
    } catch (error: any) {
      console.error('Error al guardar itinerario:', error);
      // El error ya se maneja en el hook useItineraryCRUD
    }
  };

  return (
    <I18nProvider locale="es-ES">
      <div className="p-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {mode === 'create' ? 'Nuevo Itinerario' : 'Editar Itinerario'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {mode === 'create' 
              ? 'Completa el siguiente formulario para registrar el itinerario' 
              : 'Modifica los detalles de tu itinerario'
            }
          </p>
        </div>

        {/* Form Container */}
        <div>
          <Form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            
            {/* Título del Itinerario */}
            <div className="md:col-span-2">
              <Input
                isRequired
                isDisabled={isLoading}
                errorMessage="Por favor, ingresa un título válido"
                label="Título del Itinerario"
                labelPlacement="outside"
                name="title"
                placeholder="Ej: Aventura en Europa"
                type="text"
                variant="bordered"
                size="md"
                className="font-medium"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Destino */}
            <Input
              isRequired
              isDisabled={isLoading}
              errorMessage="Por favor, ingresa un destino válido"
              label="Destino Principal"
              labelPlacement="outside"
              name="destination"
              placeholder="Ej: París, Francia"
              type="text"
              variant="bordered"
              size="md"
              startContent={<span className="text-gray-400 dark:text-gray-500">📍</span>}
              value={formData.destination}
              onChange={(e) => handleInputChange('destination', e.target.value)}
            />

            {/* Idioma */}
            <LanguageSearchSelect
              options={languages}
              value={formData.language}
              onSelectionChange={(selectedKey) => handleInputChange('language', selectedKey)}
              label="Idioma del Itinerario"
              placeholder="Buscar idioma..."
              isRequired
              isDisabled={isLoading}
            />

            {/* Tema */}
            <ThemeSearchSelect
              isRequired
              value={formData.id_theme}
              onSelectionChange={(selectedKey) => handleInputChange('id_theme', selectedKey)}
              label="Tema del Itinerario"
              placeholder="Seleccionar tema..."
              isDisabled={isLoading}
            />

            {/* Fechas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Fechas del Viaje
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatePicker 
                  label="Fecha de Inicio" 
                  variant="bordered"
                  size="md"
                  isDisabled={isLoading}
                  value={getDateState('startDate')}
                  showMonthAndYearPickers
                  onChange={(date) => handleDateChange('startDate', 'start_date', date)}
                />
                <DatePicker 
                  label="Fecha de Fin" 
                  variant="bordered"
                  size="md"
                  isDisabled={isLoading}
                  value={getDateState('endDate')}
                  showMonthAndYearPickers
                  onChange={(date) => handleDateChange('endDate', 'end_date', date)}
                />
              </div>
            </div>

            {/* Campos de Imágenes */}
            <InputImage
              required={true}
              inputTitle="Imagen del itinerario"
              pathImg={formData.path_itinerary_image || ''}
              keyObjectName="path_itinerary_image"
              changeHandler={handleInputChange}
            />

            <InputImage
              required={true}
              inputTitle="Imagen portada"
              pathImg={formData.path_img_front || ''}
              keyObjectName="path_img_front"
              changeHandler={handleInputChange}
            />

            <InputImage
              required={true}
              inputTitle="Imagen contraportada"
              pathImg={formData.path_img_back || ''}
              keyObjectName="path_img_back"
              changeHandler={handleInputChange}
            />

            <InputImage
              required={false}
              inputTitle="Imagen del cliente"
              pathImg={formData.path_img_client || ''}
              keyObjectName="path_img_client"
              changeHandler={handleInputChange}
            />

            <InputImage
              required={false}
              inputTitle="Imagen feria"
              pathImg={formData.path_img_fair || ''}
              keyObjectName="path_img_fair"
              changeHandler={handleInputChange}
            />

            {/* Botones */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-4">
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
                  : (mode === 'create' ? 'Crear Itinerario' : 'Actualizar Itinerario')
                }
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </I18nProvider>
  );
}
