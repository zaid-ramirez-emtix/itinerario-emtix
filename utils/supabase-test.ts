/**
 * Utilidades de prueba para debugging de Supabase
 */

import { createClient } from '@/utils/supabase/client'

const supabase = createClient()

/**
 * Prueba la conexión básica con Supabase
 */
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Probar consulta simple
    const { data, error } = await supabase
      .from('itinerary')
      .select('id_itinerary, title')
      .limit(1)

    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }

    console.log('Supabase connection successful, sample data:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Unexpected error testing Supabase:', error)
    return { success: false, error: 'Unexpected error' }
  }
}

/**
 * Prueba la consulta específica de días
 */
export async function testDayQuery(itineraryId: string) {
  try {
    console.log('Testing day query for itinerary:', itineraryId)
    
    // Probar consulta de días
    const { data, error, count } = await supabase
      .from('day')
      .select('*', { count: 'exact' })
      .eq('id_itinerary', itineraryId)

    if (error) {
      console.error('Day query error:', error)
      return { success: false, error: error.message }
    }

    console.log('Day query successful:', { data, count })
    return { success: true, data, count }
    
  } catch (error) {
    console.error('Unexpected error in day query:', error)
    return { success: false, error: 'Unexpected error' }
  }
}

/**
 * Prueba la inserción de un día (simulado)
 */
export async function testDayInsert(itineraryId: string) {
  try {
    console.log('Testing day insert capabilities for itinerary:', itineraryId)
    
    // Datos de prueba (sin insertar realmente)
    const testData = {
      id_itinerary: itineraryId,
      description: 'Día de prueba',
      lodging_place: 'Hotel de prueba',
      image_path: '/test.jpg',
      active: true,
      order: 999999 // Orden alto para evitar conflictos
    }

    // Solo simular la validación, no insertar
    console.log('Test data would be:', testData)
    
    // Verificar que el itinerario existe
    const { data: itinerary, error: itineraryError } = await supabase
      .from('itinerary')
      .select('id_itinerary')
      .eq('id_itinerary', itineraryId)
      .single()

    if (itineraryError) {
      console.error('Itinerary not found:', itineraryError)
      return { success: false, error: 'Itinerary not found' }
    }

    console.log('Itinerary exists:', itinerary)
    return { success: true, message: 'Insert test passed (no actual insert)' }
    
  } catch (error) {
    console.error('Unexpected error in insert test:', error)
    return { success: false, error: 'Unexpected error' }
  }
}

/**
 * Ejecuta todas las pruebas
 */
export async function runAllTests(itineraryId: string) {
  console.log('🧪 Running Supabase tests...')
  
  const connectionTest = await testSupabaseConnection()
  console.log('1. Connection test:', connectionTest)
  
  const dayQueryTest = await testDayQuery(itineraryId)
  console.log('2. Day query test:', dayQueryTest)
  
  const insertTest = await testDayInsert(itineraryId)
  console.log('3. Insert test:', insertTest)
  
  return {
    connection: connectionTest,
    dayQuery: dayQueryTest,
    insert: insertTest
  }
}
