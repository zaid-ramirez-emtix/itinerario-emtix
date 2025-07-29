'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@heroui/react'
import { IconSearch, IconCheck } from '@tabler/icons-react'

interface ActivitySearchProps {
  options: Array<{ key: string; label: string; icon: string }>
  value: string
  onSelectionChange: (value: string) => void
  placeholder?: string
  label?: string
  isRequired?: boolean
}

export function ActivitySearchSelect({
  options,
  value,
  onSelectionChange,
  placeholder = "Buscar tipo de actividad...",
  label = "Tipo de actividad",
  isRequired = false
}: ActivitySearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrar opciones basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.key.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Obtener la opción seleccionada actual
  const selectedOption = options.find(option => option.key === value)

  const handleInputFocus = () => {
    setIsOpen(true)
    setSearchTerm('')
  }

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue)
    setIsOpen(true)
  }

  const handleOptionSelect = (option: typeof options[0]) => {
    onSelectionChange(option.key)
    setIsOpen(false)
    setSearchTerm('')
    inputRef.current?.blur()
  }

  const displayValue = selectedOption ? selectedOption.label : ''

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input principal */}
      <Input
        ref={inputRef}
        label={label}
        placeholder={placeholder}
        value={isOpen ? searchTerm : displayValue}
        onValueChange={handleInputChange}
        onFocus={handleInputFocus}
        isRequired={isRequired}
        startContent={
          selectedOption ? (
            <span className="text-lg">{selectedOption.icon}</span>
          ) : (
            <IconSearch size={16} className="text-default-400" />
          )
        }
        endContent={
          selectedOption && (
            <IconCheck size={16} className="text-success" />
          )
        }
        classNames={{
          input: "cursor-pointer",
          inputWrapper: isOpen ? "border-primary" : ""
        }}
      />

      {/* Dropdown con opciones filtradas */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    value === option.key 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span className="flex-1">{option.label}</span>
                  {value === option.key && (
                    <IconCheck size={16} className="text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <IconSearch size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron resultados</p>
              <p className="text-xs">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Indicador de búsqueda activa */}
      {isOpen && searchTerm && (
        <div className="absolute top-full left-0 right-0 z-40 mt-1">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-1">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Buscando: "<strong>{searchTerm}</strong>" - {filteredOptions.length} resultado(s)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
