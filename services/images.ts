/**
 * Servicio para manejo de imágenes
 * Sube imágenes a Supabase Storage y devuelve URLs para almacenar en la base de datos
 */

import { createClient } from '@/utils/supabase/client'

/**
 * Mapeo de tipos de directorio a buckets de Supabase
 */
const BUCKET_MAPPING = {
  'days': 'days',
  'cities': 'cities',
  'backs': 'itineraries',
  'clients': 'itineraries', 
  'fairs': 'itineraries',
  'fronts': 'itineraries',
  'itinerary_image': 'itineraries',
  'agencies': 'themes'
} as const

/**
 * Sube una imagen a Supabase Storage y devuelve la URL para guardar en la base de datos
 * @param file - Archivo de imagen a subir
 * @param directory - Directorio de destino (days, cities, backs, clients, fairs, fronts, itinerary_image, agencies)
 * @param oldImageUrl - URL de la imagen anterior para eliminar (opcional)
 */
export async function uploadImage(
  file: File, 
  directory: keyof typeof BUCKET_MAPPING = 'days', 
  oldImageUrl?: string
): Promise<string> {
  try {
    // Validar el archivo
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen')
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('La imagen no puede superar los 5MB')
    }

    const supabase = createClient()
    
    // Obtener el bucket correspondiente
    const bucket = BUCKET_MAPPING[directory]
    if (!bucket) {
      throw new Error(`Directorio no válido: ${directory}`)
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${randomString}.${extension}`

    // Construir la ruta del archivo según el bucket
    let filePath: string
    if (bucket === 'itineraries') {
      // Para el bucket itineraries, usar subdirectorio según el tipo
      if (directory === 'itinerary_image') {
        filePath = fileName // En la raíz para itinerary_image
      } else {
        filePath = `${directory}/${fileName}` // En subdirectorio para backs, clients, fairs, fronts
      }
    } else {
      filePath = fileName // Para otros buckets (days, cities, themes), directamente en la raíz
    }

    // Eliminar imagen anterior si existe
    if (oldImageUrl) {
      await deleteImage(oldImageUrl)
    }

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading to Supabase:', error)
      
      // Proporcionar mensajes de error más específicos
      if (error.message.includes('row-level security policy')) {
        throw new Error('Error de permisos: Las políticas de seguridad de Supabase Storage no están configuradas correctamente. Por favor, configura las políticas RLS para el bucket.')
      } else if (error.message.includes('Bucket not found')) {
        throw new Error(`Error: El bucket "${bucket}" no existe en Supabase Storage. Por favor, créalo primero.`)
      } else if (error.message.includes('File size')) {
        throw new Error('Error: El archivo es demasiado grande para Supabase Storage.')
      } else {
        throw new Error(`Error al subir la imagen a Supabase: ${error.message}`)
      }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    if (!urlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la imagen')
    }

    return urlData.publicUrl

  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param imageUrl - URL completa de la imagen a eliminar
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl) {
      return
    }

    const supabase = createClient()
    
    // Validar que la URL sea de Supabase Storage (ser más flexible en la validación)
    const isSupabaseStorageUrl = imageUrl.includes('supabase') && 
                                (imageUrl.includes('/storage/v1/object/public') || imageUrl.includes('/storage/v1/object/'));
    
    if (!isSupabaseStorageUrl) {
      return
    }
    
    // Extraer información del path de la URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/').filter(part => part !== '')
    
    // Buscar el índice donde está 'storage' o 'public'
    let publicIndex = pathParts.findIndex(part => part === 'public')
    
    // Si no encuentra 'public', buscar 'storage' y calcular desde ahí
    if (publicIndex === -1) {
      const storageIndex = pathParts.findIndex(part => part === 'storage')
      if (storageIndex !== -1) {
        const objectIndex = pathParts.findIndex((part, index) => index > storageIndex && part === 'object')
        if (objectIndex !== -1) {
          publicIndex = objectIndex;
          if (pathParts[objectIndex + 1] === 'public') {
            publicIndex = objectIndex + 1;
          }
        }
      }
    }
    
    if (publicIndex === -1) {
      console.error('No se pudo encontrar el punto de referencia en la URL:', imageUrl)
      return
    }
    
    const bucket = pathParts[publicIndex + 1]
    const filePath = pathParts.slice(publicIndex + 2).join('/')
    
    if (!bucket || !filePath) {
      console.error('No se pudo extraer bucket o filePath de la URL:', imageUrl)
      return
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Error deleting image from Supabase:', error)
      throw new Error(`Error al eliminar imagen: ${error.message}`)
    }
  } catch (error) {
    console.error('Error general en deleteImage:', error)
    throw error
  }
}

/**
 * Valida si un archivo es una imagen válida
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Verificar tipo de archivo
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'El archivo debe ser una imagen' }
  }

  // Verificar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { isValid: false, error: 'La imagen no puede superar los 5MB' }
  }

  // Verificar extensiones permitidas
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Formato no soportado. Usa JPG, PNG o WebP' }
  }

  return { isValid: true }
}

/**
 * Obtiene las dimensiones de una imagen
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Redimensiona una imagen si es necesario
 */
export async function resizeImageIfNeeded(
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<File> {
  try {
    const dimensions = await getImageDimensions(file)
    
    // Si la imagen ya es del tamaño correcto, la devolvemos tal como está
    if (dimensions.width <= maxWidth && dimensions.height <= maxHeight) {
      return file
    }

    // Crear canvas para redimensionar
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('No se pudo crear el contexto del canvas')
    }

    // Calcular nuevas dimensiones manteniendo la proporción
    let { width, height } = dimensions
    
    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    canvas.width = width
    canvas.height = height

    // Cargar y dibujar la imagen
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })

    ctx.drawImage(img, 0, 0, width, height)

    // Convertir canvas a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(resizedFile)
          } else {
            reject(new Error('Error al procesar la imagen'))
          }
        },
        file.type,
        quality
      )
    })

  } catch (error) {
    console.error('Error resizing image:', error)
    return file // Si hay error, devolvemos el archivo original
  }
}

/**
 * Función helper para determinar el directorio correcto según el contexto
 * @param context - Contexto de uso (field name o tipo de imagen)
 * @returns Directorio correspondiente para Supabase Storage
 */
export function getDirectoryFromContext(context: string): keyof typeof BUCKET_MAPPING {
  // Mapear nombres de campos a directorios
  const contextMapping: Record<string, keyof typeof BUCKET_MAPPING> = {
    'image_path': 'days',
    'city_image_path': 'cities',
    'path_img_back': 'backs',
    'path_img_client': 'clients',
    'path_img_fair': 'fairs',
    'path_img_front': 'fronts',
    'path_itinerary_image': 'itinerary_image',
    'path_img_agency': 'agencies'
  }

  return contextMapping[context] || 'days'
}
