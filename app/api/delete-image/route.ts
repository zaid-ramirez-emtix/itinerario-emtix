import { NextRequest, NextResponse } from 'next/server'
import { deleteImageFile } from '@/services/file-cleanup'

/**
 * API para eliminar archivos de imagen específicos
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de imagen requerida' },
        { status: 400 }
      )
    }

    // Validar que sea una URL de nuestro sistema
    if (!imageUrl.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'URL no válida' },
        { status: 400 }
      )
    }

    const deleted = await deleteImageFile(imageUrl)

    return NextResponse.json({
      success: true,
      deleted,
      url: imageUrl
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
