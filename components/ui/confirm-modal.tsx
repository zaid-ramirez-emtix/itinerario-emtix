'use client'

import { Button } from '@heroui/react'
import { Modal } from './modal'
import React from 'react'

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

const ConfirmModal = React.memo(function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false
}: ConfirmModalProps) {

  const handleConfirm = React.useCallback(async () => {
    await onConfirm();
    // No cerramos el modal aquí - la función onConfirm debe manejarlo
  }, [onConfirm]);

  const modalContent = React.useMemo(() => (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <Button 
          variant="bordered" 
          onPress={onClose}
          isDisabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button 
          color={variant} 
          onPress={handleConfirm}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Eliminando...' : confirmText}
        </Button>
      </div>
    </div>
  ), [title, message, confirmText, cancelText, variant, onClose, handleConfirm, isLoading]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="sm"
      isDismissable={!isLoading}
    >
      {modalContent}
    </Modal>
  );
});

export default ConfirmModal;
