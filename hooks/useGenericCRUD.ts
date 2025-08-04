'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface CRUDOptions<T> {
  tableName: string
  idField: string
  onSuccess?: (data: T) => void
  revalidateFn?: (path: string) => void
  revalidatePath?: string
  successMessages?: {
    create?: string
    update?: string
    delete?: string
  }
}

export function useGenericCRUD<T>(options: CRUDOptions<T>) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    tableName,
    idField,
    onSuccess,
    revalidateFn,
    revalidatePath,
    successMessages = {
      create: '¡Registro creado exitosamente!',
      update: '¡Registro actualizado exitosamente!',
      delete: '¡Registro eliminado exitosamente!'
    }
  } = options

  const executeOperation = async (
    operation: 'create' | 'update' | 'delete',
    data?: Partial<T>,
    id?: string | number
  ): Promise<T | null> => {
    setIsLoading(true)
    
    try {
      let result: T | null = null

      switch (operation) {
        case 'create':
          if (!data) throw new Error('Datos son requeridos para crear')
          
          const { data: createResponse, error: createError } = await supabase
            .from(tableName)
            .insert([data])
            .select()
            .single()

          if (createError) throw createError
          result = createResponse
          toast.success(successMessages.create!)
          break

        case 'update':
          if (!data || !id) throw new Error('Datos e ID son requeridos para actualizar')
          
          const { data: updateResponse, error: updateError } = await supabase
            .from(tableName)
            .update(data)
            .eq(idField, id)
            .select()
            .single()

          if (updateError) throw updateError
          result = updateResponse
          toast.success(successMessages.update!)
          break

        case 'delete':
          if (!id) throw new Error('ID es requerido para eliminar')
          
          const { data: deleteResponse, error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq(idField, id)
            .select()
            .single()

          if (deleteError) throw deleteError
          result = deleteResponse
          toast.success(successMessages.delete!)
          break
      }

      // Revalidar datos si se especifica
      if (revalidateFn && revalidatePath) {
        revalidateFn(revalidatePath)
      }

      // Callback de éxito
      if (result) {
        onSuccess?.(result)
      }
      
      return result
    } catch (error: any) {
      console.error(`Error en operación ${operation}:`, error)
      const operationName = {
        create: 'crear',
        update: 'actualizar',
        delete: 'eliminar'
      }[operation]
      
      toast.error(error.message || `Error al ${operationName} el registro`)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const create = (data: Partial<T>) => executeOperation('create', data)
  const update = (data: Partial<T>, id: string | number) => executeOperation('update', data, id)
  const remove = (id: string | number) => executeOperation('delete', undefined, id)

  return {
    create,
    update,
    remove,
    isLoading,
    executeOperation
  }
}
