'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import TableUI from '@/components/tableUI/TableUI';
import { itineraryDeleteConfig, itineraryToggleStatusConfig } from '@/components/tableUI/deleteConfigs';
import { Column, AddButton } from '@/components/tableUI/types';
import { Spinner } from '@heroui/react';
import { StatusOptions } from '@/components/tableUI/mockData';
import { Modal, useModal } from '@/components/ui/modal';
import ConfirmModal from '@/components/ui/confirm-modal';
import { useConfirmationModal } from '@/hooks/useConfirmationModal';
import { AddItineraryModal } from '@/components/itinerary/add-itinerary-modal';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { EyeFilledIcon } from '@/components/tableUI/eye';
import { toast } from 'sonner';
import { DeleteFilledIcon } from '@/components/tableUI/delete';
import { useMemoizedCallback } from '@/hooks/useMemoizedCallback';

export default function Itineraries() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableKey, setTableKey] = useState(0); // Key para forzar re-render

  // Modal state para agregar itinerario
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const { confirmModal, showConfirmModal, closeModal } = useConfirmationModal();

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // El middleware ya verifica la autenticación, no necesitamos hacerlo aquí
      const { data: itineraries, error } = await supabase.from('itinerary').select('*');

      if (error) {
        console.error('Error al obtener datos:', error.message);
        setLoading(false);
        return;
      }

      // Normalizar los datos para utilizarlos en la tabla
      const normalizedUsers =
        itineraries.map((itinerary) => {
          const status: StatusOptions = itinerary.active ? 'Activo' : 'Inactivo';

          // Función para crear fechas locales evitando problemas de zona horaria
          const createLocalDate = (dateString: string) => {
            const dateParts = dateString.split('T')[0].split('-');
            return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
          };

          return {
            id: itinerary.id_itinerary,
            title: itinerary.title,
            destination: itinerary.destination,
            language: `${itinerary.language}`.toUpperCase(),
            start_date: createLocalDate(itinerary.start_date),
            end_date: createLocalDate(itinerary.end_date),
            status,
            created_at: createLocalDate(itinerary.created_at),
            updated_at: createLocalDate(itinerary.updated_at),
          };
        }) || [];

      setData(normalizedUsers);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleToggleStatus = useCallback(
    async (itineraryId: string, isCurrentlyActive: boolean) => {
      try {
        const supabase = createClient();
        const newActiveStatus = !isCurrentlyActive;

        const { error } = await supabase.from('itinerary').update({ active: newActiveStatus }).eq('id_itinerary', itineraryId);

        if (error) {
          console.error('Error al actualizar estado:', error);
          toast.error('Error al actualizar el estado del itinerario');
          return;
        }

        const updatedData = data.map((item) => (item.id === itineraryId ? { ...item, status: newActiveStatus ? 'Activo' : 'Inactivo' } : item));

        setData(updatedData); // en vez de onDataChange
        setTableKey((prev) => prev + 1);

        toast.success(`Itinerario ${newActiveStatus ? 'activado' : 'desactivado'} correctamente`);
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        toast.error('Error al actualizar el estado del itinerario');
      }
    },
    [data]
  );

  const handleDeleteItem = useMemoizedCallback(async (itemId: string, itemTitle: string) => {
    if (!itineraryDeleteConfig) {
      console.warn('deleteConfig not provided');
      return;
    }

    console.log('🚀 handleDeleteItem started for:', itemId);

    try {
      // Obtener información adicional si es necesario
      let additionalInfo;
      if (itineraryDeleteConfig.getAdditionalInfo) {
        additionalInfo = await itineraryDeleteConfig.getAdditionalInfo(itemId);
      }

      // Obtener el mensaje personalizado
      const { title, message } = itineraryDeleteConfig.getDeleteMessage(
        data.find((item) => item.id === itemId),
        additionalInfo
      );

      // Configurar el modal de confirmación
      showConfirmModal(title, message, async () => {
        console.log('✅ User confirmed deletion - executing deletion');

        await itineraryDeleteConfig.onDelete(itemId);

        // Actualizar datos localmente
        const updatedData = data.filter((item) => item.id !== itemId);

        if (handleDataChange) {
          handleDataChange(updatedData);
        }

        toast.success(`${itineraryDeleteConfig.entityName} eliminado correctamente`);
      });
    } catch (error) {
      console.error(`Error al obtener información del ${itineraryDeleteConfig.entityName}:`, error);
      toast.error(`Error al obtener información del ${itineraryDeleteConfig.entityName}`);
    }
  });

  useEffect(() => {
    console.log('confirmModal', confirmModal);
  }, [confirmModal]);

  // Crear las columnas de las tablas
  const columns: Column[] = [
    { name: 'Clave', uid: 'id', columnType: 'default', visible: false },
    { name: 'Título', uid: 'title', columnType: 'default', sortDirection: 'ascending', filterSearch: true },
    { name: 'Destino', uid: 'destination', columnType: 'default' },
    { name: 'Idioma', uid: 'language', columnType: 'default' },
    { name: 'Fecha de inicio', uid: 'start_date', columnType: 'date' },
    { name: 'Fecha de fin', uid: 'end_date', columnType: 'date' },
    { name: 'Estatus', uid: 'status', columnType: 'status' },
    { name: 'Fecha de creación', uid: 'created_at', columnType: 'date' },
    { name: 'Última modificación', uid: 'updated_at', columnType: 'date' },
    {
      name: 'Acciones',
      uid: 'actions',
      columnType: 'custom-actions',
      renderCell: (rowData) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            color={rowData.status === 'Activo' ? 'danger' : 'success'}
            variant="flat"
            onPress={() => {
              if (itineraryToggleStatusConfig) {
                handleToggleStatus(rowData.id, rowData.status === 'Activo');
              }
            }}
            isDisabled={!itineraryToggleStatusConfig}
            startContent={
              rowData.status === 'Activo' ? (
                <Icon icon="solar:eye-closed-linear" width={16} height={16} />
              ) : (
                <Icon icon="solar:eye-linear" width={16} height={16} />
              )
            }
          >
            {rowData.status === 'Activo' ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            as={Link}
            href={`/itinerary/${rowData.id}`}
            size="sm"
            color="primary"
            variant="flat"
            startContent={<EyeFilledIcon height={16} width={16} />}
          >
            Ver detalles
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => {
              console.log('entra');
              if (itineraryDeleteConfig) {
                handleDeleteItem(rowData.id, rowData.title || rowData.name || 'elemento');
              }
            }}
            startContent={<DeleteFilledIcon height={16} width={16} />}
            isDisabled={!itineraryDeleteConfig}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  // Función para refrescar datos desde Supabase
  const refreshData = async () => {
    const supabase = createClient();
    const { data: itineraries, error } = await supabase.from('itinerary').select('*');

    if (error) {
      console.error('Error al refrescar datos:', error.message);
      return;
    }

    // Normalizar los datos
    const normalizedUsers =
      itineraries?.map((itinerary) => {
        const status: StatusOptions = itinerary.active ? 'Activo' : 'Inactivo';

        const createLocalDate = (dateString: string) => {
          const dateParts = dateString.split('T')[0].split('-');
          return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        };

        return {
          id: itinerary.id_itinerary,
          title: itinerary.title,
          destination: itinerary.destination,
          language: `${itinerary.language}`.toUpperCase(),
          start_date: createLocalDate(itinerary.start_date),
          end_date: createLocalDate(itinerary.end_date),
          status,
        };
      }) || [];

    setData(normalizedUsers);
    setTableKey((prev) => prev + 1);
    console.log('🔄 Datos refrescados desde Supabase:', normalizedUsers.length, 'items');
  };

  // Función para manejar cambios en los datos
  const handleDataChange = (newData: any[]) => {
    setData(newData);
    setTableKey((prev) => prev + 1); // Incrementar key para forzar re-render
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">Cargando Itinerarios</p>
        </div>
      </div>
    );

  const handleItineraryAdded = () => {
    console.log('🔄 Refrescando datos después de agregar itinerario...');
    refreshData();
  };

  const buttonsAdd: AddButton[] = [
    {
      label: 'Nuevo itinerario',
      onClick: openAddModal,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section>
        <TableUI
          key={tableKey} // Key que cambia para forzar re-render
          columns={columns}
          data={data}
          title="Itinerarios"
          buttonsAdd={buttonsAdd}
          onDataChange={handleDataChange}
        />
      </section>

      {/* Modal para agregar itinerario */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Crear Nuevo Itinerario" size="lg">
        <AddItineraryModal onItineraryAdded={handleItineraryAdded} onClose={closeAddModal} />
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        isLoading={confirmModal.isLoading}
      />
    </main>
  );
}
