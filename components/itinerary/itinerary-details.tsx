'use client'

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader, Chip, Button, Spinner } from '@heroui/react'
import { IconCalendar, IconMapPin, IconLanguage, IconEdit, IconArrowLeft, IconFileTypePdf } from '@tabler/icons-react'
import { createClient } from '@/utils/supabase/client'
import { Itinerary } from '@/types/itinerary'
import Link from 'next/link'
import { toast } from 'sonner'
import { Modal, useModal } from "@/components/ui/modal";
import ItineraryEdit from "../itinerary/itinerary-edit";
import { ItineraryDays } from "./itinerary-days";

export function ItineraryDetails({id}: {id: string}) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, openModal, closeModal } = useModal();
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('itinerary')
          .select('*')
          .eq('id_itinerary', id)
          .single()

        if (error) {
          console.error('Error fetching itinerary:', error)
          setError('Error al cargar el itinerario')
          toast.error('Error al cargar el itinerario')
          return
        }

        if (!data) {
          setError('Itinerario no encontrado')
          toast.error('Itinerario no encontrado')
          return
        }

        setItinerary(data)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Error inesperado al cargar el itinerario')
        toast.error('Error inesperado al cargar el itinerario')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchItinerary()
    }
  }, [id])

  const formatDate = (dateString: string) => {
    // Asegurar que tratamos la fecha como local evitando problemas de zona horaria
    const dateParts = dateString.split('T')[0].split('-'); // Obtener solo la parte de fecha
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getLanguageLabel = (lang: string) => {
    const languages: { [key: string]: string } = {
      'es': 'Español',
      'en': 'English'
    }
    return languages[lang] || lang
  }

  const handleItineraryUpdate = (updatedItinerary: Itinerary) => {
    setItinerary(updatedItinerary)
    toast.success('Itinerario actualizado correctamente')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-red-500">
          {error || 'Itinerario no encontrado'}
        </h2>
        <Button as={Link} href="/" color="primary" variant="ghost">
          <IconArrowLeft size={16} />
          Volver a itinerarios
        </Button>
      </div>
    )
  }

  const duration = itinerary.start_date && itinerary.end_date 
    ? (() => {
        // Crear fechas locales evitando problemas de zona horaria
        const startParts = itinerary.start_date.split('T')[0].split('-');
        const endParts = itinerary.end_date.split('T')[0].split('-');
        const startDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));
        const endDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
        return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      })()
    : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header con título */}
      <div className="flex items-center gap-3">
        <Button 
          as={Link} 
          href="/" 
          isIconOnly 
          variant="ghost"
          className="text-default-500"
        >
          <IconArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {itinerary.title}
          </h1>
          <p className="text-default-500 mt-1">
            Detalles del itinerario
          </p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onPress={openModal}
          color="secondary"
          variant="solid"
          startContent={<IconEdit size={16} />}
        >
          Editar Itinerario
        </Button>
  
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title="Editar Itinerario"
          size="lg"
        >
          <ItineraryEdit 
            id={id} 
            onUpdate={handleItineraryUpdate}
            onClose={closeModal}
          />
        </Modal>
        
        <Button 
          color="secondary"
          variant="bordered"
          startContent={<IconFileTypePdf size={16} />}
          className="flex-1 sm:flex-none"
          onPress={() => toast.info('Funcionalidad de PDF próximamente')}
        >
          Ver PDF
        </Button>
      </div>

      {/* Información principal */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-1">
            <h2 className="text-xl font-semibold">Información general</h2>
            <p className="text-small text-default-500">
              Datos básicos del itinerario
            </p>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Destino */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <IconMapPin size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Destino</h3>
                <p className="text-default-600">{itinerary.destination}</p>
              </div>
            </div>

            {/* Idioma */}
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <IconLanguage size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Idioma</h3>
                <Chip 
                  color="secondary" 
                  variant="flat" 
                  size="sm"
                  className="mt-1"
                >
                  {getLanguageLabel(itinerary.language)}
                </Chip>
              </div>
            </div>

            {/* Fechas */}
            <div className="flex items-start space-x-3 md:col-span-2">
              <div className="flex-shrink-0 mt-1">
                <IconCalendar size={20} className="text-primary" />
              </div>
              <div className="w-full">
                <h3 className="font-medium text-foreground mb-2">Fechas del viaje</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-default-100 rounded-lg p-3">
                    <p className="text-small text-default-500 mb-1">Fecha de inicio</p>
                    <p className="font-medium text-foreground">
                      {formatDate(itinerary.start_date)}
                    </p>
                  </div>
                  <div className="bg-default-100 rounded-lg p-3">
                    <p className="text-small text-default-500 mb-1">Fecha de fin</p>
                    <p className="font-medium text-foreground">
                      {formatDate(itinerary.end_date)}
                    </p>
                  </div>
                </div>
                {duration > 0 && (
                  <div className="mt-3">
                    <Chip color="primary" variant="flat" size="sm">
                      {duration} {duration === 1 ? 'día' : 'días'} de duración
                    </Chip>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Días del itinerario */}
      <ItineraryDays itineraryId={id} />
    </div>
  )
}