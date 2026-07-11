import { useState } from 'react';
import Modal from './Modal';
import { useGameStore } from '../game/store';
import type { QuizCard } from '../game/types';
import { QUIZ_STAGE_LABEL } from '../game/logic';

interface Props {
  card: QuizCard;
  round: number;
  onClose: () => void;
}

export default function QuizModal({ card, round, onClose }: Props) {
  const answerQuiz = useGameStore((s) => s.answerQuiz);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; gained: number } | null>(null);

  const isDue = card.due <= round;

  function choose(i: number) {
    if (result) return;
    setSelected(i);
    const r = answerQuiz(card.id, i);
    setResult(r);
  }

  return (
    <Modal onClose={onClose} width={520}>
      <span className="card-tile__badge">🧠 問答 · {QUIZ_STAGE_LABEL[card.stage]}</span>
      <h3>{card.question}</h3>
      {!isDue && !result && (
        <p className="muted">這張卡片還沒到複習輪次，但你仍然可以先練習。</p>
      )}
      <div className="quiz-choices">
        {card.choices.map((choice, i) => {
          let cls = 'quiz-choice';
          if (result) {
            if (i === card.answerIndex) cls += ' quiz-choice--correct';
            else if (i === selected) cls += ' quiz-choice--wrong';
          }
          return (
            <button key={i} className={cls} disabled={!!result} onClick={() => choose(i)}>
              {choice}
            </button>
          );
        })}
      </div>
      {result && (
        <div className={`quiz-result ${result.correct ? 'quiz-result--correct' : 'quiz-result--wrong'}`}>
          <p>{result.correct ? `答對了！+${result.gained} 💎` : '答錯了，連擊歸零。'}</p>
          {card.explanation && <p className="muted">{card.explanation}</p>}
          <button className="btn btn-primary" onClick={onClose}>關閉</button>
        </div>
      )}
    </Modal>
  );
}
