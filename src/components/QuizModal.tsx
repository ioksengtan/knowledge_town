import { useState } from 'react';
import Modal from './Modal';
import { useGameStore, type AnswerQuizResult } from '../game/store';
import type { QuizCard } from '../game/types';
import { currentRound, QUIZ_STAGE_LABEL, RESOURCE_ICON } from '../game/logic';

interface Props {
  card: QuizCard;
  onClose: () => void;
}

export default function QuizModal({ card, onClose }: Props) {
  const answerQuiz = useGameStore((s) => s.answerQuiz);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerQuizResult | null>(null);

  const round = currentRound();
  const daysLeft = card.due - round;
  const isDue = daysLeft <= 0;

  function choose(i: number) {
    if (result || !isDue) return;
    setSelected(i);
    const r = answerQuiz(card.id, i);
    if (r.notDue) return;
    setResult(r);
  }

  return (
    <Modal onClose={onClose} width={520}>
      <span className="card-tile__badge">🧠 問答 · {QUIZ_STAGE_LABEL[card.stage]}</span>
      <h3>{card.question}</h3>
      {!isDue && (
        <p className="muted">
          這張卡片還沒到複習日，{daysLeft} 天後才能作答——先去複習其他到期的卡片吧。
        </p>
      )}
      {card.courseId && !result && (
        <p className="muted">這是課程的一堂課——完成整個課程才會一次發放獎勵，這一堂本身不會馬上給資源。</p>
      )}
      <div className="quiz-choices">
        {card.choices.map((choice, i) => {
          let cls = 'quiz-choice';
          if (result) {
            if (i === card.answerIndex) cls += ' quiz-choice--correct';
            else if (i === selected) cls += ' quiz-choice--wrong';
          }
          return (
            <button key={i} className={cls} disabled={!!result || !isDue} onClick={() => choose(i)}>
              {choice}
            </button>
          );
        })}
      </div>
      {result && (
        <div className={`quiz-result ${result.correct ? 'quiz-result--correct' : 'quiz-result--wrong'}`}>
          <p>
            {result.correct
              ? result.courseCompleted
                ? `🎉 課程全部完成！+${result.gained} ${RESOURCE_ICON.ore}`
                : result.resourceType
                  ? `答對了！+${result.gained} ${RESOURCE_ICON[result.resourceType]}`
                  : '答對了！這堂課記錄下來了，等課程全部完成再一次領獎勵。'
              : '答錯了，連擊歸零。'}
          </p>
          {card.example && <p className="muted">{card.example}</p>}
          <button className="btn btn-primary" onClick={onClose}>關閉</button>
        </div>
      )}
    </Modal>
  );
}
