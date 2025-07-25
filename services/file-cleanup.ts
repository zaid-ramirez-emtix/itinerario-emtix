// NOTA: Este archivo solo debe ser importado en APIs del servidor (app/api/*)
// Para operaciones del cliente, usar file-cleanup-client.ts

import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Elimina un archivo de imagen del servidor
 * @param imageUrl - URL pública de la imagen (ej: /uploads/days/123456-abc.jpg)
 * @returns Promise<boolean> - true si se eliminó correctamente, false si no existía
 */
export async function deleteImageFile(imageUrl: string): Promise<boolean> {
  try {
    // Verificar que la URL sea válida y apunte a nuestro directorio de uploads
    if (!imageUrl || !imageUrl.startsWith('/uploads/')) {
      console.log('URL no válida para eliminar:', imageUrl)
      return false
    }

    // Convertir URL pública a ruta del sistema de archivos
    const relativePath = imageUrl.replace('/uploads/', '')
    const filePath = join(process.cwd(), 'public', 'uploads', relativePath)

    // Verificar que el archivo existe antes de intentar eliminarlo
    if (!existsSync(filePath)) {
      console.log('Archivo no encontrado para eliminar:', filePath)
      return false
    }

    // Eliminar el archivo
    await unlink(filePath)
    console.log('Imagen eliminada exitosamente:', filePath)
    return true

  } catch (error) {
    console.error('Error eliminando archivo:', error)
    return false
  }
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
