import type { ReactNode } from 'react';

interface Props {
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export default function Modal({ onClose, children, width = 480 }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel panel" style={{ width }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="關閉">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
