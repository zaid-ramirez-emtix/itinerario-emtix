'use client';

import { useEffect, useState } from 'react';
import { Input, Button, DatePicker } from '@heroui/react';
import { IconPlus, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';
import { ItineraryInsert } from '@/types/itinerary';
import { createClient } from '@/utils/supabase/client';
import { LanguageSearchSelect } from '@/components/ui/language-search-select';
import { CalendarDate } from '@internationalized/date';
import { I18nProvider } from '@react-aria/i18n';
import InputImage from '@/components/formElements/InputImage';

interface AddItineraryModalProps {
  onItineraryAdded: (itinerary: any) => void;
  onClose: () => void;
}

export function AddItineraryModal({ onItineraryAdded, onClose }: AddItineraryModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ItineraryInsert>({
    active: true,
    destination: '',
    end_date: '',
    id_theme: 'ab92c40f-762f-4a61-8d80-590f83473601', // Mismo ID hardcodeado que en el formulario original
    language: '',
    path_img_back: '',
    path_img_client: '',
    path_img_fair: '',
    path_img_front: '',
    start_date: '',
    title: '',
  });

  useEffect(() => {
    console.log('FormData actualizado:', formData);
  }, [formData]);

  // Estados separados para las fechas del DatePicker
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);

  const LANGUAGES = [
    { key: 'es', label: 'Español' },
    { key: 'en', label: 'English' },
  ];

  const supabase = createClient();

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Crear nuevo itinerario
      const { data, error } = await supabase.from('itinerary').insert([formData]).select().single();

      if (error) throw error;

      toast.success('¡Itinerario creado exitosamente!');
      onItineraryAdded(data);
      onClose();
    } catch (error: any) {
      console.error('Error al crear itinerario:', error);
      toast.error(error.message || 'Error al crear el itinerario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <I18nProvider locale="es-ES">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Nuevo Itinerario</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Completa el siguiente formulario para registrar el itinerario</p>
        </div>

        {/* Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
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
            isRequired
            options={LANGUAGES}
            value={formData.language}
            onSelectionChange={(selectedKey) => handleInputChange('language', selectedKey)}
            label="Idioma del Itinerario"
            placeholder="Buscar idioma..."
            isDisabled={isLoading}
          />

          {/* Fechas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📅 Fechas del Viaje</label>
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
                isRequired
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

          <InputImage
            inputTitle="Imagen portada *"
            pathImg={formData.path_img_front || ''}
            keyObjectName="path_img_front"
            directory="itinerary/front"
            changeHandler={handleInputChange}
          />

          <InputImage
            inputTitle="Imagen contraportada *"
            pathImg={formData.path_img_back || ''}
            keyObjectName="path_img_back"
            directory="itinerary/back"
            changeHandler={handleInputChange}
          />

          <InputImage
            inputTitle="Imagen del cliente"
            pathImg={formData.path_img_client || ''}
            keyObjectName="path_img_client"
            directory="itinerary/client"
            changeHandler={handleInputChange}
          />
          <InputImage
            inputTitle="Imagen feria"
            pathImg={formData.path_img_fair || ''}
            keyObjectName="path_img_fair"
            directory="itinerary/fair"
            changeHandler={handleInputChange}
          />

          {/* Botones */}
          <div className="md:col-span-2 flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="bordered"
              size="md"
              className="px-6"
              isDisabled={isLoading}
              onPress={onClose}
              startContent={<IconX size={16} />}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="primary"
              size="md"
              className="px-8"
              isLoading={isLoading}
              disabled={isLoading}
              startContent={!isLoading && <IconPlus size={16} />}
            >
              {isLoading ? 'Creando...' : 'Crear Itinerario'}
            </Button>
          </div>
        </form>
      </div>
    </I18nProvider>
  );
}
