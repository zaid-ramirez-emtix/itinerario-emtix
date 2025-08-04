'use client'

import { useGenericCRUD } from './useGenericCRUD'

interface CityInsert {
  city_name: string;
  city_image_path: string | null;
  active?: boolean;
}

interface CityUpdate extends Partial<CityInsert> {}

interface CityRow extends CityInsert {
  id_city: string;
  created_at: string;
  updated_at: string;
  active: boolean;
}

interface CityCRUDOptions {
  onSuccess?: (data: CityRow) => void;
  revalidatePath?: string;
}

export function useCityCRUD(options: CityCRUDOptions = {}) {
  const {
    create,
    update,
    remove,
    isLoading
  } = useGenericCRUD<CityRow>({
    tableName: 'city',
    idField: 'id_city',
    onSuccess: options.onSuccess,
    revalidatePath: options.revalidatePath,
    successMessages: {
      create: '¡Ciudad creada exitosamente!',
      update: '¡Ciudad actualizada exitosamente!',
      delete: '¡Ciudad eliminada exitosamente!'
    }
  })

  const createCity = async (cityData: CityInsert): Promise<CityRow | null> => {
    return await create(cityData)
  }

  const updateCity = async (cityData: CityUpdate, id: string): Promise<CityRow | null> => {
    return await update(cityData, id)
  }

  const deleteCity = async (id: string): Promise<void> => {
    await remove(id)
  }

  return {
    createCity,
    updateCity,
    deleteCity,
    isLoading
  }
}
