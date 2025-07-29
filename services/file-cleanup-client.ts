/**
 * Servicio para manejo de archivos desde el cliente
 * Utiliza APIs del servidor para operaciones de archivos
 */

/**
 * Verifica si una URL apunta a una imagen subida por nuestra aplicación
 * @param imageUrl - URL a verificar
 * @returns boolean - true si es una imagen de nuestra aplicación
 */
export function isOurUploadedImage(imageUrl: string): boolean {
  if (!imageUrl) return false
  
  // Verificar que sea una URL de nuestro sistema de uploads
  if (!imageUrl.startsWith('/uploads/')) return false
  
  // Verificar que no sea una imagen placeholder
  if (imageUrl.includes('/api/placeholder/')) return false
  
  // Verificar que tenga un formato de nombre válido (timestamp-random.extension)
  const fileName = extractFileNameFromUrl(imageUrl)
  const validNamePattern = /^\d+-[a-z0-9]+\.[a-z]{3,4}$/i
  
  return validNamePattern.test(fileName)
}

/**
 * Extrae el nombre del archivo de una URL de imagen
 * @param imageUrl - URL pública de la imagen
 * @returns string - nombre del archivo o empty string si no es válido
 */
export function extractFileNameFromUrl(imageUrl: string): string {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
    return ''
  }
  
  const parts = imageUrl.split('/')
  return parts[parts.length - 1] || ''
}

/**
 * Elimina un archivo de imagen del servidor usando la API
 * @param imageUrl - URL pública de la imagen a eliminar
 * @returns Promise<boolean> - true si se eliminó correctamente
 */
export async function deleteImageFile(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl || !isOurUploadedImage(imageUrl)) {
      return false
    }

    const response = await fetch(`/api/delete-image?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      console.error('Error response from delete API:', response.status)
      return false
    }

    const data = await response.json()
    return data.success && data.deleted

  } catch (error) {
    console.error('Error calling delete API:', error)
    return false
  }
}
