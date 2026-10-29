"use client";

import { useState } from 'react';
import { Sheet } from 'kadesh/components/shared';
import ClaimReportForm from './ClaimReportForm';

interface ClaimReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  animalId: string;
  animalName?: string | null;
  defaultPhone?: string | null;
  onDone?: () => void;
}

export default function ClaimReportModal({
  isOpen,
  onClose,
  animalId,
  animalName,
  defaultPhone,
  onDone,
}: ClaimReportModalProps) {
  const [busy, setBusy] = useState(false);

  return (
    <Sheet isOpen={isOpen} title="Es mi mascota" onClose={onClose} busy={busy}>
      <ClaimReportForm
        animalId={animalId}
        animalName={animalName}
        defaultPhone={defaultPhone}
        onCancel={onClose}
        onBusyChange={setBusy}
        onDone={() => {
          onClose();
          onDone?.();
        }}
      />
    </Sheet>
  );
}
