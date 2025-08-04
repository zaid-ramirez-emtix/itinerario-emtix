'use client'

import DayForm from './day-form';
import { DayWithActivities } from '@/types/itinerary';

interface AddDayModalProps {
  itineraryId: string;
  onDayAdded: (day: DayWithActivities) => void;
  onClose: () => void;
}

export function AddDayModal({ itineraryId, onDayAdded, onClose }: AddDayModalProps) {
  const handleSuccess = (data: DayWithActivities) => {
    onDayAdded(data);
    onClose();
  };

  return (
    <DayForm 
      mode="create" 
      itineraryId={itineraryId}
      onSuccess={handleSuccess}
      onCancel={onClose}
    />
  );
}
