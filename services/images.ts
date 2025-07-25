/**
 * Servicio para manejo de imágenes
 * Sube imágenes localmente y devuelve URLs para almacenar en Supabase
 */

import { toast } from 'sonner'
import { isOurUploadedImage } from './file-cleanup-client'

/**
 * Sube una imagen y devuelve la URL para guardar en la base de datos
 * @param file - Archivo de imagen a subir
 * @param folder - Carpeta de destino (days, activities, etc.)
 * @param oldImageUrl - URL de la imagen anterior para eliminar (opcional)
 */
export async function uploadImage(
  file: File, 
  folder: string = 'days', 
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

    // Crear FormData para la subida
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    
    // Si hay una imagen anterior válida, incluirla para eliminación automática
    if (oldImageUrl && isOurUploadedImage(oldImageUrl)) {
      formData.append('oldImageUrl', oldImageUrl)
    }

    // Hacer la petición a la API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Error al subir la imagen')
    }

    const data = await response.json()
    
    if (!data.success || !data.url) {
      throw new Error('Respuesta inválida del servidor')
    }

    // Log informativo si se eliminó una imagen anterior
    if (data.oldImageDeleted) {
      console.log('Imagen anterior eliminada automáticamente:', oldImageUrl)
    }

    return data.url

  } catch (error) {
    console.error('Error uploading image:', error)
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
