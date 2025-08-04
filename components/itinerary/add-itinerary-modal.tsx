'use client';

import ItineraryForm from './itinerary-form';

interface AddItineraryModalProps {
  onItineraryAdded: (itinerary: any) => void;
  onClose: () => void;
}

export function AddItineraryModal({ onItineraryAdded, onClose }: AddItineraryModalProps) {
  const handleSuccess = (data: any) => {
    onItineraryAdded(data);
    onClose();
  };

  return (
    <ItineraryForm 
      mode="create" 
      onSuccess={handleSuccess}
      onCancel={onClose}
    />
  );
}
