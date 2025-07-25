'use client'

import { Form, Input, Button } from "@heroui/react";
import { useState, useEffect } from 'react'
import { DatePicker } from "@heroui/react";
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { ItineraryInsert, ItineraryFormProps } from '@/types/itinerary';
import { CalendarDate, parseDate } from "@internationalized/date";
import { LanguageSearchSelect } from '@/components/ui/language-search-select'
import { I18nProvider } from "@react-aria/i18n";
import { revalidateItinerary } from "./itinerary-server";

export default function ItineraryForm({ 
  initialData, 
  mode, 
  onSuccess, 
  onCancel 
}: ItineraryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ItineraryInsert>({
    title: '',
    destination: '',
    language: '',
    start_date: '',
    end_date: '',
    id_theme: '' // Requerido según database.ts
  });
  
  // Estados separados para las fechas del DatePicker
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);

  const languages = [
    { key: "es", label: "Español" },
    { key: "en", label: "English" },
  ];

  const supabase = createClient();

  // Efecto para inicializar los datos cuando se reciben initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        destination: initialData.destination || '',
        language: initialData.language || '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        id_theme: initialData.id_theme || '',
      });

      // Convertir fechas string a CalendarDate para los DatePickers
      if (initialData.start_date) {
        try {
          const dateStr = initialData.start_date.split('T')[0]; // Obtener solo la parte de fecha
          setStartDate(parseDate(dateStr));
        } catch (error) {
          console.error('Error parsing start date:', error);
        }
      }

      if (initialData.end_date) {
        try {
          const dateStr = initialData.end_date.split('T')[0]; // Obtener solo la parte de fecha
          setEndDate(parseDate(dateStr));
        } catch (error) {
          console.error('Error parsing end date:', error);
        }
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // const { data: { user } } = await supabase.auth.getUser();
      
      // if (!user) {
      //   toast.error('Debes estar autenticado para realizar esta acción');
      //   return;
      // }

      if (mode === 'create') {
        // Crear nuevo itinerario
        const { data, error } = await supabase
          .from('itinerary')
          .insert([
            {
              ...formData,
              "id_theme": "ab92c40f-762f-4a61-8d80-590f83473601" // TODO: No dejar el tema hardcodeado
            }
          ])
          .select()
          .single();

        if (error) throw error;

        toast.success('¡Itinerario creado exitosamente!');
        revalidateItinerary('/itinerary')
        onSuccess?.(data);
      } else {
        // Actualizar itinerario existente
        const { data, error } = await supabase
          .from('itinerary')
          .update({
            ...formData,
          })
          .eq('id_itinerary', initialData?.id_itinerary)
          .select()
          .single();

        if (error) throw error;

        revalidateItinerary('/itinerary')
        onSuccess?.(data);
      }
    } catch (error: any) {
      console.error('Error al guardar itinerario:', error);
      toast.error(error.message || 'Error al guardar el itinerario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
                  value={startDate}
                  showMonthAndYearPickers
                  onChange={(date) => {
                    setStartDate(date);
                    if (date) {
                      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                      handleInputChange('start_date', dateStr);
                    } else {
                      handleInputChange('start_date', '');
                    }
                  }}
                />
                <DatePicker 
                  label="Fecha de Fin" 
                  variant="bordered"
                  size="md"
                  isDisabled={isLoading}
                  value={endDate}
                  showMonthAndYearPickers
                  onChange={(date) => {
                    setEndDate(date);
                    if (date) {
                      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                      handleInputChange('end_date', dateStr);
                    } else {
                      handleInputChange('end_date', '');
                    }
                  }}
                />
              </div>
            </div>

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
