'use client'

import ActivityForm from './activity-form';
import { Activity } from '@/types/itinerary';

interface AddActivityModalProps {
  dayId: string;
  onActivityAdded: (activity: Activity) => void;
  onClose: () => void;
}

export function AddActivityModal({ dayId, onActivityAdded, onClose }: AddActivityModalProps) {
  const handleSuccess = (data: Activity) => {
    onActivityAdded(data);
    onClose();
  };

  return (
    <ActivityForm 
      mode="create" 
      dayId={dayId}
      onSuccess={handleSuccess}
      onCancel={onClose}
    />
  );
}
