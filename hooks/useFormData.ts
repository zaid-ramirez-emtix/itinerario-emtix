'use client'

import { useState, useEffect } from 'react'
import { CalendarDate, parseDate } from "@internationalized/date"

interface UseFormDataOptions<T> {
  initialData?: T | null
  dateFields?: Array<{
    field: keyof T
    stateField: string
  }>
}

export function useFormData<T extends Record<string, any>>(
  defaultValues: T,
  options: UseFormDataOptions<T> = {}
) {
  const [formData, setFormData] = useState<T>(defaultValues)
  const [dateStates, setDateStates] = useState<Record<string, CalendarDate | null>>({})

  // Efecto para inicializar los datos cuando se reciben initialData
  useEffect(() => {
    if (options.initialData) {
      const initialFormData = { ...defaultValues }
      
      // Copiar solo los datos que existen en defaultValues (campos válidos)
      Object.keys(options.initialData).forEach(key => {
        if (
          options.initialData![key] !== undefined && 
          options.initialData![key] !== null &&
          key in defaultValues  // Solo copiar campos que existen en defaultValues
        ) {
          initialFormData[key as keyof T] = options.initialData![key] || ''
        }
      })
      
      setFormData(initialFormData)

      // Manejar fechas si se especificaron
      if (options.dateFields) {
        const newDateStates: Record<string, CalendarDate | null> = {}
        
        options.dateFields.forEach(({ field, stateField }) => {
          const dateValue = options.initialData![field]
          if (dateValue) {
            try {
              const dateStr = String(dateValue).split('T')[0] // Obtener solo la parte de fecha
              newDateStates[stateField] = parseDate(dateStr)
            } catch (error) {
              console.error(`Error parsing ${String(field)} date:`, error)
              newDateStates[stateField] = null
            }
          } else {
            newDateStates[stateField] = null
          }
        })
        
        setDateStates(newDateStates)
      }
    } else {
      // Si no hay initialData, usar los valores por defecto
      setFormData(defaultValues)
      setDateStates({})
    }
  }, [options, defaultValues])

  const handleInputChange = (name: string, value: string) => {
    console.log(`handleInputChange llamado: ${name} = ${value}`)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (stateField: string, formField: string, date: CalendarDate | null) => {
    setDateStates(prev => ({
      ...prev,
      [stateField]: date
    }))

    if (date) {
      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
      handleInputChange(formField, dateStr)
    } else {
      handleInputChange(formField, '')
    }
  }

  const resetForm = () => {
    setFormData(defaultValues)
    setDateStates({})
  }

  const getDateState = (stateField: string): CalendarDate | null => {
    return dateStates[stateField] || null
  }

  return {
    formData,
    setFormData,
    handleInputChange,
    handleDateChange,
    getDateState,
    resetForm
  }
}
