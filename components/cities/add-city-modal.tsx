'use client';

import CityForm from './city-form';

interface AddCityModalProps {
  onCityAdded: (city: any) => void;
  onClose: () => void;
}

export function AddCityModal({ onCityAdded, onClose }: AddCityModalProps) {
  const handleSuccess = (data: any) => {
    onCityAdded(data);
    onClose();
  };

  return (
    <CityForm 
      mode="create" 
      onSuccess={handleSuccess}
      onCancel={onClose}
    />
  );
}
