'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ItineraryInsert } from '@/types/itinerary'

interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function useItineraryValidation() {
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const validateItinerary = (formData: ItineraryInsert): ValidationResult => {
    const errors: string[] = []

    // Validación de tema
    if (!formData.id_theme) {
      errors.push('Por favor, selecciona un tema para el itinerario.')
    }

    // Validaciones de imágenes requeridas
    const requiredImageFields = [
      { field: 'path_itinerary_image', label: 'Imagen del itinerario' },
      { field: 'path_img_front', label: 'Imagen portada' },
      { field: 'path_img_back', label: 'Imagen contraportada' }
    ]

    for (const { field, label } of requiredImageFields) {
      if (!formData[field as keyof typeof formData]) {
        errors.push(`${label} es requerida`)
      }
    }

    // Validaciones básicas
    if (!formData.title?.trim()) {
      errors.push('El título es requerido')
    }

    if (!formData.destination?.trim()) {
      errors.push('El destino es requerido')
    }

    if (!formData.language) {
      errors.push('El idioma es requerido')
    }

    if (!formData.start_date) {
      errors.push('La fecha de inicio es requerida')
    }

    if (!formData.end_date) {
      errors.push('La fecha de fin es requerida')
    }

    // Validación de fechas
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (startDate >= endDate) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio')
      }
    }

    setValidationErrors(errors)

    // Mostrar errores en toast
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const clearValidationErrors = () => {
    setValidationErrors([])
  }

  return {
    validateItinerary,
    validationErrors,
    clearValidationErrors
  }
}
