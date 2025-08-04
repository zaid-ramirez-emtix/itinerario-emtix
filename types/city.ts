import { Database } from './database';

// Tipos extraídos de la base de datos
export type CityRow = Database['public']['Tables']['city']['Row'];
export type CityInsert = Database['public']['Tables']['city']['Insert'];
export type CityUpdate = Database['public']['Tables']['city']['Update'];

// Tipos para el formulario
export interface CityFormData {
  city_name: string;
  city_image_path: string | null;
  active: boolean;
}

// Tipos para la normalización de datos en la tabla
export interface NormalizedCity {
  id: string;
  name: string;
  img_src: string | null;
  status: 'Activo' | 'Inactivo';
  created_at: string;
  updated_at: string;
}

// Props para los componentes
export interface CityFormProps {
  initialData?: CityRow | null;
  mode: 'create' | 'edit';
  onSuccess?: (data: CityRow) => void;
  onCancel?: () => void;
}

export interface AddCityModalProps {
  onCityAdded: (city: CityRow) => void;
  onClose: () => void;
}

export interface EditCityModalProps {
  id: string;
  onUpdate?: (updatedCity: CityRow) => void;
  onClose?: () => void;
}
