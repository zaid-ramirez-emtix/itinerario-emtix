'use client'

import { createClient } from '@/utils/supabase/client'
import { DayWithActivities, Day, Activity, DayInsert, ActivityInsert } from '@/types/itinerary'

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
      .select('*')
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
 * Crea un nuevo día
 */
export async function createDay(dayData: Omit<DayInsert, 'id_day' | 'created_at' | 'order'>): Promise<Day> {
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

    // Insertar el nuevo día
    const { data, error } = await supabase
      .from('day')
      .insert(newDayData)
      .select()
      .single()

    if (error) {
      console.error('Error creating day:', error)
      console.error('Supabase error details:', JSON.stringify(error, null, 2))
      throw new Error(`Error al crear el día: ${error.message}`)
    }

    if (!data) {
      throw new Error('No se pudo crear el día - sin datos devueltos')
    }

    console.log('Day created successfully:', data)
    return data
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
 * Actualiza un día existente
 */
export async function updateDay(dayId: string, dayData: Partial<Omit<DayInsert, 'id_day' | 'created_at' | 'order'>>): Promise<Day> {
  try {
    console.log('Updating day with id:', dayId, 'data:', dayData)

    const { data, error } = await supabase
      .from('day')
      .update(dayData)
      .eq('id_day', dayId)
      .select()
      .single()

    if (error) {
      console.error('Error updating day:', error)
      console.error('Supabase error details:', JSON.stringify(error, null, 2))
      throw new Error(`Error al actualizar el día: ${error.message}`)
    }

    if (!data) {
      throw new Error('No se pudo actualizar el día - sin datos devueltos')
    }

    console.log('Day updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error in updateDay:', error)
    throw error
  }
}

/**
 * Activa/desactiva un día
 */
export async function toggleDayActive(dayId: string, active: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('day')
      .update({ active })
      .eq('id_day', dayId)

    if (error) {
      console.error('Error toggling day active:', error)
      throw new Error('Error al cambiar el estado del día')
    }
  } catch (error) {
    console.error('Error in toggleDayActive:', error)
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

    const { data, error } = await supabase
      .from('activity')
      .update(activityData)
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
 * Activa/desactiva una actividad
 */
export async function toggleActivityActive(activityId: string, active: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('activity')
      .update({ active })
      .eq('id_activity', activityId)

    if (error) {
      console.error('Error toggling activity active:', error)
      throw new Error('Error al cambiar el estado de la actividad')
    }
  } catch (error) {
    console.error('Error in toggleActivityActive:', error)
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
      .order('name_city', { ascending: true })

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
