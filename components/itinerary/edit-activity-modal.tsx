'use client'

import ActivityForm from './activity-form';
import { Activity } from '@/types/itinerary';

interface EditActivityModalProps {
  activity: Activity;
  onActivityUpdated: (updatedActivity: Activity) => void;
  onClose: () => void;
}

export function EditActivityModal({ activity, onActivityUpdated, onClose }: EditActivityModalProps) {
  const handleSuccess = (data: Activity) => {
    onActivityUpdated(data);
    onClose();
  };

  return (
    <ActivityForm 
      mode="edit" 
      initialData={activity}
      dayId={activity.id_day}
      onSuccess={handleSuccess}
      onCancel={onClose}
    />
  );
}
