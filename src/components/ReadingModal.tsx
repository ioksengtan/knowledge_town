import { useState } from 'react';
import Modal from './Modal';
import { useGameStore } from '../game/store';
import type { ReadingCard } from '../game/types';

interface Props {
  card: ReadingCard;
  onClose: () => void;
}

export default function ReadingModal({ card, onClose }: Props) {
  const completeReading = useGameStore((s) => s.completeReading);
  const [page, setPage] = useState(0);
  const [gained, setGained] = useState<number | null>(null);

  const isLast = page === card.pages.length - 1;

  function next() {
    if (!isLast) {
      setPage((p) => p + 1);
      return;
    }
    if (!card.claimed) {
      setGained(completeReading(card.id));
    } else {
      onClose();
    }
  }

  const current = card.pages[page];

  return (
    <Modal onClose={onClose} width={560}>
      <span className="card-tile__badge">📖 閱讀</span>
      <h3>{card.title}</h3>
      {card.source && <p className="muted">{card.source}</p>}
      <p className="muted">第 {page + 1} / {card.pages.length} 頁</p>
      <p className="reading-page">{current.content}</p>
      {current.example && <p className="reading-example">例如：{current.example}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button className="btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          上一頁
        </button>
        {gained === null ? (
          <button className="btn btn-primary" onClick={next}>
            {isLast ? (card.claimed ? '關閉' : '完成閱讀') : '下一頁'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onClose}>
            完成！+{gained} 💎
          </button>
        )}
      </div>
    </Modal>
  );
}
