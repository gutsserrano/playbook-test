"use client";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  onClickBackdrop?: (e: React.MouseEvent) => void;
  contentClassName?: string;
}

export function Modal({ children, onClose, onClickBackdrop, contentClassName }: ModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClickBackdrop?.(e);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-turf-800 rounded-xl border border-turf-600 w-full max-w-md p-6 shadow-xl my-auto ${contentClassName ?? ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
