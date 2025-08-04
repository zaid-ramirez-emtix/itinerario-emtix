'use client'

import DayForm from './day-form';
import { Day, DayWithActivities } from '@/types/itinerary';

interface EditDayModalProps {
  day: Day;
  onDayUpdated: (updatedDay: DayWithActivities) => void;
  onClose: () => void;
}

export function EditDayModal({ day, onDayUpdated, onClose }: EditDayModalProps) {
  const handleSuccess = (data: DayWithActivities) => {
    onDayUpdated(data);
    onClose();
  };

  return (
    <DayForm 
      mode="edit" 
      initialData={day}
      itineraryId={day.id_itinerary}
      onSuccess={handleSuccess}
      onCancel={onClose}
    />
  );
}
