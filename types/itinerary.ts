export interface ItineraryData {
  id_itinerary?: string;
  title: string;
  destination: string;
  language: string;
  start_date: string;
  end_date: string;
  id_theme?: string;
}

export interface ItineraryFormProps {
  initialData?: ItineraryData;
  mode: 'create' | 'edit';
  onSuccess?: (data: ItineraryData) => void;
  onCancel?: () => void;
}
