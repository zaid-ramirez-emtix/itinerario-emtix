'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@heroui/react'
import { IconSearch, IconCheck, IconPalette } from '@tabler/icons-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface Theme {
  id_theme: string;
  name_theme: string;
  active: boolean;
}

interface ThemeSearchSelectProps {
  value: string;
  onSelectionChange: (selectedKey: string) => void;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
}

export function ThemeSearchSelect({
  value,
  onSelectionChange,
  label = "Tema",
  placeholder = "Buscar tema...",
  isRequired = false,
  isDisabled = false,
}: ThemeSearchSelectProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Array<{ key: string; label: string }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Cargar temas desde la base de datos
  useEffect(() => {
    const loadThemes = async () => {
      try {
        const { data, error } = await supabase
          .from('theme')
          .select('id_theme, name_theme, active')
          .eq('active', true)
          .order('name_theme');

        if (error) {
          console.error('Error loading themes:', error);
          toast.error('Error al cargar temas');
          return;
        }

        setThemes(data || []);
      } catch (error) {
        console.error('Error in loadThemes:', error);
        toast.error('Error al cargar temas disponibles');
      } finally {
        setIsLoading(false);
      }
    };

    loadThemes();
  }, [supabase]);

  // Convertir themes a opciones y filtrar basado en el término de búsqueda
  useEffect(() => {
    const options = themes.map(theme => ({
      key: theme.id_theme,
      label: theme.name_theme
    }));

    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.key.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, themes]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obtener la opción seleccionada actual
  const selectedOption = filteredOptions.find(option => option.key === value) || 
                        themes.find(theme => theme.id_theme === value);

  const handleInputFocus = () => {
    if (!isDisabled && !isLoading) {
      setIsOpen(true);
      setSearchTerm('');
    }
  };

  const handleInputChange = (inputValue: string) => {
    if (!isDisabled && !isLoading) {
      setSearchTerm(inputValue);
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (option: { key: string; label: string }) => {
    onSelectionChange(option.key);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const displayValue = selectedOption ? 
    ('label' in selectedOption ? selectedOption.label : selectedOption.name_theme) : '';

  // Mapeo de iconos por tema
  const getThemeIcon = (themeKey: string) => {
    const iconMap: Record<string, string> = {
      'adventure': '🏔️',
      'relaxation': '🏖️',
      'culture': '🏛️',
      'food': '🍽️',
      'nature': '🌿',
      'urban': '🏙️',
      'beach': '🏖️',
      'mountain': '⛰️',
      'historical': '🏰',
      'romantic': '💕',
      'family': '👨‍👩‍👧‍👦',
      'backpacking': '🎒'
    };
    
    // Buscar por nombre del tema en caso de que no coincida exactamente con la key
    const themeName = themes.find(t => t.id_theme === themeKey)?.name_theme.toLowerCase() || '';
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (themeName.includes(key) || themeKey.toLowerCase().includes(key)) {
        return icon;
      }
    }
    
    return '🎨'; // Icono por defecto
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label externo */}
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Input principal */}
      <Input
        ref={inputRef}
        placeholder={isLoading ? "Cargando temas..." : placeholder}
        value={isOpen ? searchTerm : displayValue}
        onValueChange={handleInputChange}
        onFocus={handleInputFocus}
        isDisabled={isDisabled || isLoading}
        variant="bordered"
        size="md"
        startContent={
          selectedOption ? (
            <span className="text-lg">{getThemeIcon(value)}</span>
          ) : (
            <IconPalette size={16} className="text-gray-400 dark:text-gray-500" />
          )
        }
        endContent={
          selectedOption && (
            <IconCheck size={16} className="text-success" />
          )
        }
        classNames={{
          input: (isDisabled || isLoading) ? "" : "cursor-pointer",
          inputWrapper: isOpen ? "border-primary" : ""
        }}
      />

      {/* Dropdown con opciones filtradas */}
      {isOpen && !isDisabled && !isLoading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                    value === option.key 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{getThemeIcon(option.key)}</span>
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
              <p className="text-sm">No se encontraron temas</p>
              <p className="text-xs">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Indicador de búsqueda activa */}
      {isOpen && searchTerm && !isDisabled && !isLoading && (
        <div className="absolute top-full left-0 right-0 z-40 mt-1">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-1">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Buscando: "<strong>{searchTerm}</strong>" - {filteredOptions.length} resultado(s)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
