'use client'

import { createClient } from '@/utils/supabase/client'
import { DayWithActivities, Activity, DayInsert, ActivityInsert } from '@/types/itinerary'
import { deleteImage } from './images'

const supabase = createClient()

// ============================================================================
// OPERACIONES DE DÍAS
// ============================================================================

/**
 * Obtiene todos los días de un itinerario con sus actividades
 */
export async function getDaysWithActivities(itineraryId: string): Promise<DayWithActivities[]> {
  try {
    const { data: days, error: daysError } = await supabase
      .from('day')
      .select(`
        *,
        city:id_city (
          id_city,
          city_name,
          city_image_path
        )
      `)
      .eq('id_itinerary', itineraryId)
      .order('order', { ascending: true })

    if (daysError) {
      console.error('Error fetching days:', daysError)
      throw new Error('Error al cargar los días del itinerario')
    }

    if (!days || days.length === 0) {
      return []
    }

    // Obtener actividades para todos los días
    const dayIds = days.map(day => day.id_day)
    const { data: activities, error: activitiesError } = await supabase
      .from('activity')
      .select('*')
      .in('id_day', dayIds)
      .order('order', { ascending: true })

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError)
      throw new Error('Error al cargar las actividades')
    }

    // Combinar días con sus actividades
    const daysWithActivities: DayWithActivities[] = days.map(day => ({
      ...day,
      activities: activities?.filter(activity => activity.id_day === day.id_day) || []
    }))

    return daysWithActivities
  } catch (error) {
    console.error('Error in getDaysWithActivities:', error)
    throw error
  }
}

/**
 * Crea un nuevo día y retorna los datos completos con información de la ciudad
 */
export async function createDay(dayData: Omit<DayInsert, 'id_day' | 'created_at' | 'order'>): Promise<DayWithActivities> {
  try {
    console.log('Creating day with data:', dayData)

    // Verificar que id_itinerary esté presente
    if (!dayData.id_itinerary) {
      throw new Error('id_itinerary es requerido para crear un día')
    }

    // Obtener el siguiente orden consultando los días existentes
    let nextOrder = 1
    
    try {
      const { data: existingDays, error: countError } = await supabase
        .from('day')
        .select('order')
        .eq('id_itinerary', dayData.id_itinerary)
        .order('order', { ascending: false })
        .limit(1)

      if (countError) {
        console.warn('Could not get existing days order, using default:', countError)
      } else if (existingDays && existingDays.length > 0) {
        nextOrder = existingDays[0].order + 1
      }
    } catch (orderError) {
      console.warn('Error getting order, using default 1:', orderError)
    }

    console.log('Using order:', nextOrder)

    const newDayData: DayInsert = {
      ...dayData,
      order: nextOrder,
    }

    console.log('Inserting day with data:', newDayData)

    // Insertar el nuevo día y obtener la información completa con la ciudad
    const { data, error } = await supabase
      .from('day')
      .insert(newDayData)
      .select(`
        *,
        city:id_city (
          id_city,
          city_name,
          city_image_path
        )
      `)
      .single()

    if (error) {
      console.error('Error creating day:', error)
      console.error('Supabase error details:', JSON.stringify(error, null, 2))
      throw new Error(`Error al crear el día: ${error.message}`)
    }

    if (!data) {
      throw new Error('No se pudo crear el día - sin datos devueltos')
    }

    // Crear el objeto DayWithActivities con array vacío de actividades
    const dayWithActivities: DayWithActivities = {
      ...data,
      activities: []
    }

    console.log('Day created successfully with complete data:', dayWithActivities)
    return dayWithActivities
  } catch (error) {
    console.error('Error in createDay:', error)
    throw error
  }
}

/**
 * Actualiza el orden de los días
 */
export async function updateDaysOrder(days: { id_day: string; order: number }[]): Promise<void> {
  try {
    const updates = days.map(day => 
      supabase
        .from('day')
        .update({ order: day.order })
        .eq('id_day', day.id_day)
    )

    const results = await Promise.all(updates)
    
    for (const result of results) {
      if (result.error) {
        console.error('Error updating day order:', result.error)
        throw new Error('Error al actualizar el orden de los días')
      }
    }
  } catch (error) {
    console.error('Error in updateDaysOrder:', error)
    throw error
  }
}

/**
 * Actualiza un día y retorna los datos completos con información de la ciudad
 */
export async function updateDay(dayId: string, dayData: Partial<Omit<DayInsert, 'id_day' | 'created_at' | 'order'>>): Promise<DayWithActivities> {
  try {
    console.log('Updating day with id:', dayId, 'data:', dayData)
    
    // Filtrar solo los campos válidos de la tabla day
    const allowedFields = [
      'id_itinerary', 'id_city', 'day_description', 'lodging_place', 
      'image_path', 'active', 'updated_at'
    ];
    
    const cleanDayData: any = {};
    Object.keys(dayData).forEach(key => {
      if (allowedFields.includes(key) && dayData[key as keyof typeof dayData] !== undefined) {
        cleanDayData[key] = dayData[key as keyof typeof dayData];
      }
    });
    
    console.log('Clean day data being sent to DB:', cleanDayData);

    const { data, error } = await supabase
      .from('day')
      .update(cleanDayData)
      .eq('id_day', dayId)
      .select(`
        *,
        city:id_city (
          id_city,
          city_name,
          city_image_path
        )
      `)
      .single()

    if (error) {
      console.error('Error updating day:', error)
      console.error('Supabase error details:', JSON.stringify(error, null, 2))
      throw new Error(`Error al actualizar el día: ${error.message}`)
    }

    if (!data) {
      throw new Error('No se pudo actualizar el día - sin datos devueltos')
    }

    // Obtener las actividades del día
    const { data: activities, error: activitiesError } = await supabase
      .from('activity')
      .select('*')
      .eq('id_day', dayId)
      .order('order', { ascending: true })

    if (activitiesError) {
      console.error('Error fetching activities for updated day:', activitiesError)
      throw new Error('Error al cargar las actividades del día actualizado')
    }

    // Combinar el día con sus actividades
    const dayWithActivities: DayWithActivities = {
      ...data,
      activities: activities || []
    }

    console.log('Day updated successfully with complete data:', dayWithActivities)
    return dayWithActivities
  } catch (error) {
    console.error('Error in updateDay:', error)
    throw error
  }
}

// ============================================================================
// OPERACIONES DE ACTIVIDADES
// ============================================================================

/**
 * Crea una nueva actividad
 */
export async function createActivity(activityData: Omit<ActivityInsert, 'id_activity' | 'created_at' | 'order'>): Promise<Activity> {
  try {
    console.log('Creating activity with data:', activityData)

    // Obtener el siguiente orden para este día
    let nextOrder = 1

    try {
      const { data: existingActivities, error: countError } = await supabase
        .from('activity')
        .select('order')
        .eq('id_day', activityData.id_day)
        .order('order', { ascending: false })
        .limit(1)

      if (countError) {
        console.warn('Could not get existing activities order, using default:', countError)
      } else if (existingActivities && existingActivities.length > 0) {
        nextOrder = existingActivities[0].order + 1
      }
    } catch (orderError) {
      console.warn('Error getting activity order, using default 1:', orderError)
    }

    console.log('Using activity order:', nextOrder)

    const newActivityData: ActivityInsert = {
      ...activityData,
      order: nextOrder,
      active: true
    }

    const { data: newActivity, error } = await supabase
      .from('activity')
      .insert(newActivityData)
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      console.error('Supabase error details:', JSON.stringify(error, null, 2))
      throw new Error(`Error al crear la actividad: ${error.message}`)
    }

    if (!newActivity) {
      throw new Error('No se pudo crear la actividad - sin datos devueltos')
    }

    console.log('Activity created successfully:', newActivity)
    return newActivity
  } catch (error) {
    console.error('Error in createActivity:', error)
    throw error
  }
}

/**
 * Actualiza una actividad existente
 */
export async function updateActivity(activityId: string, activityData: Partial<Omit<ActivityInsert, 'id_activity' | 'created_at' | 'order'>>): Promise<Activity> {
  try {
    console.log('Updating activity with id:', activityId, 'data:', activityData)
    
    // Filtrar solo los campos válidos de la tabla activity
    const allowedFields = [
      'id_day', 'activity_type', 'transfer_time', 'activity_description', 
      'activity_link', 'active', 'updated_at'
    ];
    
    const cleanActivityData: any = {};
    Object.keys(activityData).forEach(key => {
      if (allowedFields.includes(key) && activityData[key as keyof typeof activityData] !== undefined) {
        cleanActivityData[key] = activityData[key as keyof typeof activityData];
      }
    });
    
    console.log('Clean activity data being sent to DB:', cleanActivityData);

    const { data, error } = await supabase
      .from('activity')
      .update(cleanActivityData)
      .eq('id_activity', activityId)
      .select()
      .single()

    if (error) {
      console.error('Error updating activity:', error)
      console.error('Supabase error details:', JSON.stringify(error, null, 2))
      throw new Error(`Error al actualizar la actividad: ${error.message}`)
    }

    if (!data) {
      throw new Error('No se pudo actualizar la actividad - sin datos devueltos')
    }

    console.log('Activity updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error in updateActivity:', error)
    throw error
  }
}

/**
 * Actualiza el orden de las actividades de un día
 */
export async function updateActivitiesOrder(activities: { id_activity: string; order: number }[]): Promise<void> {
  try {
    const updates = activities.map(activity => 
      supabase
        .from('activity')
        .update({ order: activity.order })
        .eq('id_activity', activity.id_activity)
    )

    const results = await Promise.all(updates)
    
    for (const result of results) {
      if (result.error) {
        console.error('Error updating activity order:', result.error)
        throw new Error('Error al actualizar el orden de las actividades')
      }
    }
  } catch (error) {
    console.error('Error in updateActivitiesOrder:', error)
    throw error
  }
}



/**
 * Elimina un día y todas sus actividades
 */
export async function deleteDay(dayId: string): Promise<void> {
  try {
    // Primero obtener la información del día para acceder a la imagen
    const { data: dayData, error: dayFetchError } = await supabase
      .from('day')
      .select('image_path')
      .eq('id_day', dayId)
      .single()

    if (dayFetchError && dayFetchError.code !== 'PGRST116') {
      throw new Error('Error al obtener información del día')
    }

    // Eliminar la imagen del bucket si existe
    if (dayData?.image_path) {
      try {
        await deleteImage(dayData.image_path)
      } catch (imageError) {
        // No lanzar error aquí para permitir que continúe la eliminación del día
      }
    }

    // Eliminar todas las actividades del día
    const { error: activitiesError } = await supabase
      .from('activity')
      .delete()
      .eq('id_day', dayId)

    if (activitiesError) {
      throw new Error('Error al eliminar las actividades del día')
    }

    if (activitiesError) {
      throw new Error('Error al eliminar las actividades del día')
    }

    // Finalmente eliminar el día
    const { error: dayError } = await supabase
      .from('day')
      .delete()
      .eq('id_day', dayId)

    if (dayError) {
      throw new Error('Error al eliminar el día')
    }
  } catch (error) {
    throw error
  }
}

/**
 * Elimina una actividad específica
 */
export async function deleteActivity(activityId: string): Promise<void> {
  try {
    // Eliminar la actividad
    const { error } = await supabase
      .from('activity')
      .delete()
      .eq('id_activity', activityId)

    if (error) {
      throw new Error('Error al eliminar la actividad')
    }
  } catch (error) {
    throw error
  }
}

// ============================================================================
// OPERACIONES DE CIUDADES
// ============================================================================

/**
 * Obtiene todas las ciudades disponibles
 */
export async function getCities() {
  try {
    const { data: cities, error } = await supabase
      .from('city')
      .select('*')
      .order('city_name', { ascending: true })

    if (error) {
      console.error('Error fetching cities:', error)
      throw new Error('Error al cargar las ciudades')
    }

    return cities || []
  } catch (error) {
    console.error('Error in getCities:', error)
    throw error
  }
}

// ============================================================================
// OPERACIONES DE ITINERARIOS
// ============================================================================

/**
 * Elimina un itinerario completo con todos sus días, actividades e imágenes asociadas
 */
export async function deleteItinerary(itineraryId: string): Promise<void> {
  try {
    // 1. Obtener la información del itinerario para acceder a su imagen
    const { data: itineraryData, error: itineraryFetchError } = await supabase
      .from('itinerary')
      .select('path_itinerary_image')
      .eq('id_itinerary', itineraryId)
      .single()

    if (itineraryFetchError && itineraryFetchError.code !== 'PGRST116') {
      throw new Error('Error al obtener información del itinerario')
    }

    // 2. Obtener todos los días del itinerario con sus imágenes
    const { data: days, error: daysError } = await supabase
      .from('day')
      .select('id_day, image_path')
      .eq('id_itinerary', itineraryId)

    if (daysError) {
      throw new Error('Error al obtener los días del itinerario')
    }

    // 3. Eliminar imágenes de todos los días
    if (days && days.length > 0) {
      for (const day of days) {
        if (day.image_path) {
          try {
            await deleteImage(day.image_path)
          } catch (imageError) {
            // Continuar con las demás imágenes aunque una falle
          }
        }
      }
    }

    // 4. Eliminar todas las actividades de todos los días
    if (days && days.length > 0) {
      const dayIds = days.map(day => day.id_day)
      const { error: activitiesError } = await supabase
        .from('activity')
        .delete()
        .in('id_day', dayIds)

      if (activitiesError) {
        throw new Error('Error al eliminar las actividades del itinerario')
      }
    }

    // 5. Eliminar todos los días del itinerario
    const { error: daysDeleteError } = await supabase
      .from('day')
      .delete()
      .eq('id_itinerary', itineraryId)

    if (daysDeleteError) {
      throw new Error('Error al eliminar los días del itinerario')
    }

    // 6. Eliminar la imagen del itinerario si existe
    if (itineraryData?.path_itinerary_image) {
      try {
        await deleteImage(itineraryData.path_itinerary_image)
      } catch (imageError) {
        // No lanzar error aquí para permitir que continúe la eliminación del itinerario
      }
    }

    // 7. Finalmente eliminar el itinerario
    const { error: itineraryError } = await supabase
      .from('itinerary')
      .delete()
      .eq('id_itinerary', itineraryId)

    if (itineraryError) {
      throw new Error('Error al eliminar el itinerario')
    }
  } catch (error) {
    throw error
  }
}
