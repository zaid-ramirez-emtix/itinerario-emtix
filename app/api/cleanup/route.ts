import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { deleteImageFile, extractFileNameFromUrl } from '@/services/file-cleanup'
import { createClient } from '@/utils/supabase/server'

/**
 * API para limpieza de imágenes huérfanas
 * Elimina archivos de imagen que no están siendo referenciados en la base de datos
 */
export async function POST(request: NextRequest) {
  try {
    // Solo permitir en desarrollo por seguridad
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Esta función solo está disponible en desarrollo' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    
    // Obtener todas las URLs de imágenes de la base de datos
    const { data: days, error: daysError } = await supabase
      .from('day')
      .select('image_path')
      .not('image_path', 'is', null)

    if (daysError) {
      throw new Error('Error al obtener datos de la base de datos')
    }

    // Crear set de URLs de imágenes en uso
    const imagesInUse = new Set<string>()
    days?.forEach(day => {
      if (day.image_path && day.image_path.startsWith('/uploads/')) {
        imagesInUse.add(extractFileNameFromUrl(day.image_path))
      }
    })

    // Obtener todos los archivos en el directorio de uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'days')
    let allFiles: string[] = []
    
    try {
      allFiles = await readdir(uploadsDir)
    } catch (error) {
      return NextResponse.json({
        success: true,
        message: 'Directorio de uploads no encontrado',
        orphanedFiles: [],
        deletedFiles: 0
      })
    }

    // Identificar archivos huérfanos
    const orphanedFiles: string[] = []
    for (const file of allFiles) {
      const filePath = join(uploadsDir, file)
      const stats = await stat(filePath)
      
      // Solo procesar archivos (no directorios)
      if (stats.isFile() && !imagesInUse.has(file)) {
        orphanedFiles.push(file)
      }
    }

    // Eliminar archivos huérfanos
    let deletedCount = 0
    const deletedFiles: string[] = []
    
    for (const file of orphanedFiles) {
      const imageUrl = `/uploads/days/${file}`
      const deleted = await deleteImageFile(imageUrl)
      if (deleted) {
        deletedCount++
        deletedFiles.push(file)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Limpieza completada. ${deletedCount} archivos eliminados.`,
      totalFiles: allFiles.length,
      filesInUse: imagesInUse.size,
      orphanedFiles: orphanedFiles.length,
      deletedFiles: deletedCount,
      deletedFilesList: deletedFiles
    })

  } catch (error) {
    console.error('Error in cleanup:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
