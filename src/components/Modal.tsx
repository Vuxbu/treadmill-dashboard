import React from 'react';

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ title, isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="panel w-full max-w-md p-6 relative">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
        <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
}
