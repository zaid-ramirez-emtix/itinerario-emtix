import { useState } from 'react';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function useConfirmationModal() {
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
    isLoading: false
  });

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        try {
          // Activar loading
          setConfirmModal(prev => ({ ...prev, isLoading: true }));
          
          await onConfirm();
          
          // Cerrar modal si todo va bien
          setConfirmModal({
            isOpen: false,
            title: '',
            message: '',
            onConfirm: async () => {},
            isLoading: false
          });
        } catch (error) {
          // En caso de error, solo desactivar loading pero mantener modal abierto
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
          throw error; // Re-lanzar error para manejo adicional
        }
      },
      isLoading: false
    });
  };

  const closeModal = () => {
    if (!confirmModal.isLoading) {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  return {
    confirmModal,
    showConfirmModal,
    closeModal
  };
}
