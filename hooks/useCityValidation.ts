'use client'

import { toast } from 'sonner'

interface CityData {
  city_name: string;
  city_image_path: string | null;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useCityValidation() {
  const validateCity = (cityData: CityData): ValidationResult => {
    const errors: string[] = []

    // Validar nombre de la ciudad
    if (!cityData.city_name || cityData.city_name.trim().length === 0) {
      errors.push('El nombre de la ciudad es obligatorio')
    } else if (cityData.city_name.trim().length < 2) {
      errors.push('El nombre de la ciudad debe tener al menos 2 caracteres')
    } else if (cityData.city_name.trim().length > 100) {
      errors.push('El nombre de la ciudad no debe exceder 100 caracteres')
    }

    // Validar imagen de la ciudad
    if (!cityData.city_image_path || cityData.city_image_path.trim().length === 0) {
      errors.push('La imagen de la ciudad es obligatoria')
    }

    // Mostrar errores si los hay
    if (errors.length > 0) {
      errors.forEach(error => {
        toast.error(error)
      })
      return { isValid: false, errors }
    }

    return { isValid: true, errors: [] }
  }

  return {
    validateCity
  }
}
