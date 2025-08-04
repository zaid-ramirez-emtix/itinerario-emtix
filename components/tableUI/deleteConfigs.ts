import { createClient } from '@/utils/supabase/client';
import { deleteItinerary } from '@/services/itinerary';

// Configuración de eliminación para itinerarios
export const itineraryDeleteConfig = {
  entityName: 'Itinerario',
  getDeleteMessage: (itinerary: any, additionalInfo?: any) => {
    const dayCount = additionalInfo?.dayCount || 0;
    return {
      title: 'Eliminar itinerario completo',
      message: `¿Estás seguro de que quieres eliminar permanentemente el itinerario "${itinerary.title}"? ${
        dayCount > 0 
          ? `También se eliminarán ${dayCount} ${dayCount === 1 ? 'día' : 'días'} y todas sus actividades e imágenes asociadas.` 
          : 'Se eliminarán todas las imágenes asociadas.'
      } Esta acción no se puede deshacer.`
    };
  },
  onDelete: async (itineraryId: string) => {
    await deleteItinerary(itineraryId);
  },
  getAdditionalInfo: async (itineraryId: string) => {
    const supabase = createClient();
    const { data: days } = await supabase
      .from('day')
      .select('id_day')
      .eq('id_itinerary', itineraryId);
    
    return {
      dayCount: days?.length || 0
    };
  }
};

// Configuración de toggle status para itinerarios
export const itineraryToggleStatusConfig = {
  entityName: 'Itinerario',
  onToggle: async (itineraryId: string, isCurrentlyActive: boolean) => {
    const supabase = createClient();
    const newActiveStatus = !isCurrentlyActive;

    // Actualizar en Supabase
    const { error } = await supabase
      .from('itinerary')
      .update({ active: newActiveStatus })
      .eq('id_itinerary', itineraryId);

    if (error) {
      throw new Error('Error al actualizar estado en la base de datos');
    }

    return newActiveStatus;
  }
};

// Configuración de eliminación para ciudades (ejemplo)
export const cityDeleteConfig = {
  entityName: 'Ciudad',
  getDeleteMessage: (city: any) => ({
    title: 'Eliminar ciudad',
    message: `¿Estás seguro de que quieres eliminar la ciudad "${city.name}"? Esta acción no se puede deshacer.`
  }),
  onDelete: async (cityId: string) => {
    // Aquí iría la lógica para eliminar ciudad
    console.log('Eliminar ciudad:', cityId);
    throw new Error('Función de eliminación de ciudad no implementada');
  }
};

// Configuración genérica para elementos simples
export const createSimpleDeleteConfig = (entityName: string, deleteFunction: (id: string) => Promise<void>) => ({
  entityName,
  getDeleteMessage: (item: any) => ({
    title: `Eliminar ${entityName.toLowerCase()}`,
    message: `¿Estás seguro de que quieres eliminar "${item.name || item.title}"? Esta acción no se puede deshacer.`
  }),
  onDelete: deleteFunction
});
