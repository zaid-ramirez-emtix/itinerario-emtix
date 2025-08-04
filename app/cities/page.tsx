'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import TableUI from '@/components/tableUI/TableUI';
import { Button } from '@heroui/react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { Modal, ModalContent } from '@heroui/react';

import { AddButton, Column } from '@/components/tableUI/types';
import { createLocalDate } from '@/helpers/dates';
import { citiesToggleStatusConfig } from '@/components/tableUI/deleteConfigs';
import { AddCityModal } from '@/components/cities/add-city-modal';
import CityEdit from '@/components/cities/edit-city-modal';

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tableKey, setTableKey] = useState(0);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: cities, error } = await supabase.from('city').select('*');

      if (error) {
        console.error('Error al obtener datos:', error.message);
        setLoading(false);
        return;
      }

      // Normalizar los datos para utilizarlos en la tabla
      const normalizedCities =
        cities.map((city) => {
          return {
            id: city.id_city,
            name: city.city_name,
            img_src: city.city_image_path,
            status: city.active ? 'Activo' : 'Inactivo',
            created_at: createLocalDate(city.created_at),
            updated_at: createLocalDate(city.updated_at),
          };
        }) || [];

      setData(normalizedCities);
      setLoading(false);
    }

    fetchData();
  }, []);

  const handleToggleStatus = useCallback(
    async (cityId: string, isCurrentlyActive: boolean) => {
      try {
        const supabase = createClient();
        const newActiveStatus = !isCurrentlyActive;

        const { error } = await supabase.from('city').update({ active: newActiveStatus }).eq('id_city', cityId);

        if (error) {
          console.error('Error al actualizar estado:', error);
          toast.error('Error al actualizar el estado de la ciudad');
          return;
        }

        const updatedData = data.map((item) => (item.id === cityId ? { ...item, status: newActiveStatus ? 'Activo' : 'Inactivo' } : item));

        setData(updatedData);
        setTableKey((prev) => prev + 1);

        toast.success(`Ciudad ${newActiveStatus ? 'activada' : 'desactivada'} correctamente`);
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        toast.error('Error al actualizar el estado de la ciudad');
      }
    },
    [data]
  );

  // Crear las columnas de las tablas
  const columns: Column[] = [
    { name: 'Clave', uid: 'id', columnType: 'default', visible: false },
    { name: 'Nombre', uid: 'name', columnType: 'default', sortDirection: 'ascending', filterSearch: true },
    { name: 'Imagen', uid: 'img_src', columnType: 'image', imageHeight: 200 },
    { name: 'Estado', uid: 'status', columnType: 'status' },
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
              if (citiesToggleStatusConfig) {
                handleToggleStatus(rowData.id, rowData.status === 'Activo');
              }
            }}
            isDisabled={!citiesToggleStatusConfig}
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
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => handleEditCity(rowData.id)}
            startContent={<Icon icon="solar:pen-linear" className="cursor-pointer text-default-400" height={18} width={18} />}
          >
            Editar ciudad
          </Button>
        </div>
      ),
    },
  ];

  // Función para refrescar datos desde Supabase
  const refreshData = async () => {
    const supabase = createClient();
    const { data: cities, error } = await supabase.from('city').select('*');

    if (error) {
      console.error('Error al refrescar datos:', error.message);
      return;
    }

    // TODO: Crear una interfaz para los datos normalizados
    // Normalizar los datos
    const normalizedCities =
      cities.map((city) => {
        return {
          id: city.id_city,
          name: city.city_name,
          img_src: city.city_image_path,
          status: city.active ? 'Activo' : 'Inactivo',
          created_at: createLocalDate(city.created_at),
          updated_at: createLocalDate(city.updated_at),
        };
      }) || [];

    setData(normalizedCities);
    setTableKey((prev) => prev + 1);
    console.log('🔄 Datos refrescados desde Supabase:', normalizedCities.length, 'items');
  };

  // Función para manejar cambios en los datos
  const handleDataChange = (newData: any[]) => {
    setData(newData);
    setTableKey((prev) => prev + 1); // Incrementar key para forzar re-render
  };

  // Función alternativa para refrescar después de agregar
  const handleCityAdded = () => {
    console.log('🔄 Refrescando datos después de agregar ciudad...');
    refreshData();
  };

  // Funciones para manejar modales
  const handleAddCity = () => {
    setShowAddModal(true);
  };

  const handleEditCity = (cityId: string) => {
    setEditingCityId(cityId);
    setShowEditModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCityId(null);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  const buttonsAdd: AddButton[] = [
    {
      label: 'Nueva ciudad',
      onClick: handleAddCity,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <section>
        <TableUI
          key={tableKey} // Key que cambia para forzar re-render
          columns={columns}
          data={data}
          title="Catálogo de ciudades"
          buttonsAdd={buttonsAdd}
          onDataChange={handleDataChange}
        />
      </section>

      {/* Modal para agregar ciudad */}
      <Modal 
        isOpen={showAddModal} 
        onOpenChange={setShowAddModal}
        size="lg"
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          <AddCityModal 
            onCityAdded={handleCityAdded} 
            onClose={handleCloseModals} 
          />
        </ModalContent>
      </Modal>

      {/* Modal para editar ciudad */}
      <Modal 
        isOpen={showEditModal} 
        onOpenChange={setShowEditModal}
        size="lg"
        placement="center"
        scrollBehavior="inside"
      >
        <ModalContent>
          {editingCityId && (
            <CityEdit 
              id={editingCityId}
              onUpdate={handleCityAdded}
              onClose={handleCloseModals}
            />
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
