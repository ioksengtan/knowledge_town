import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingSprite from '../components/BuildingSprite';
import QuizModal from '../components/QuizModal';
import ReadingModal from '../components/ReadingModal';
import ResourceBar from '../components/ResourceBar';
import { cardsForDomain, coursesForDomain, useGameStore } from '../game/store';
import {
  appearanceStage,
  canAfford,
  CATEGORY_LABEL,
  CATEGORY_RESOURCE,
  currentRound,
  formatCost,
  QUIZ_STAGE_LABEL,
  RESOURCE_LABEL,
  splitCost,
  upgradeCost,
} from '../game/logic';
import type { Card, QuizCard, ReadingCard } from '../game/types';

export default function BuildingDetail() {
  const { mapId, domainId } = useParams();
  const navigate = useNavigate();
  const map = useGameStore((s) => (mapId ? s.maps[mapId] : undefined));
  const domain = useGameStore((s) => (domainId ? s.domains[domainId] : undefined));
  const cards = useGameStore((s) => s.cards);
  const courses = useGameStore((s) => s.courses);
  const upgradeDomain = useGameStore((s) => s.upgradeDomain);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  if (!map || !domain) {
    return (
      <div>
        <p>找不到這棟建築。</p>
        <button className="btn" onClick={() => navigate(-1)}>返回</button>
      </div>
    );
  }

  const domainCards = cardsForDomain(cards, domain.id);
  const domainCourses = domain.isResearchCenter ? coursesForDomain(courses, domain.id) : [];
  const cost = splitCost(upgradeCost(domain.level));
  const cappedByHall = domain.level >= map.townHallLevel;
  const resourceType = CATEGORY_RESOURCE[domain.category];

  return (
    <div>
      <button className="btn" onClick={() => navigate(`/map/${map.id}`)}>← 返回城鎮</button>

      <div className="panel building-detail-header">
        <BuildingSprite category={domain.category} level={domain.level} size={96} />
        <div style={{ flex: 1 }}>
          <h1>{domain.name}</h1>
          <p className="muted">
            {CATEGORY_LABEL[domain.category]} · 產出 {RESOURCE_LABEL[resourceType]} · {domain.description}
          </p>
          <p>
            Lv.{domain.level}（外觀階段 {appearanceStage(domain.level)}/5）
            {cappedByHall && <span className="muted"> · 已達總部等級天花板</span>}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: 8 }}>
            <ResourceBar resources={map.resources} />
          </div>
          <div>
            <button
              className="btn btn-primary"
              disabled={cappedByHall || !canAfford(map.resources, cost)}
              onClick={() => upgradeDomain(domain.id)}
              title={cappedByHall ? '需先升級總部才能繼續升級此建築' : undefined}
            >
              升級（{formatCost(cost)}）
            </button>
          </div>
        </div>
      </div>

      {domain.isResearchCenter && (
        <div className="panel research-center-card">
          <h3>🎓 研究中心</h3>
          {domainCourses.length === 0 ? (
            <p className="muted">目前還沒有課程內容。</p>
          ) : (
            domainCourses.map((course) => {
              const done = course.lessonIds.filter((id) => cards[id]?.claimed).length;
              return (
                <div key={course.id} className="course-row">
                  <span>{course.completed ? '✅' : '📚'} {course.name}</span>
                  <span className="muted">{done} / {course.lessonIds.length} 堂{course.completed ? '（已領獎勵）' : ''}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      <h3>知識卡片</h3>
      <div className="card-grid">
        {domainCards.map((c) => (
          <div key={c.id} className="panel card-tile" onClick={() => setActiveCard(c)}>
            {c.type === 'quiz' ? <QuizCardSummary card={c} /> : <ReadingCardSummary card={c} />}
          </div>
        ))}
      </div>

      {activeCard && activeCard.type === 'quiz' && (
        <QuizModal card={activeCard} onClose={() => setActiveCard(null)} />
      )}
      {activeCard && activeCard.type === 'reading' && (
        <ReadingModal card={activeCard} onClose={() => setActiveCard(null)} />
      )}
    </div>
  );
}

function QuizCardSummary({ card }: { card: QuizCard }) {
  const daysLeft = card.due - currentRound();
  return (
    <>
      <span className="card-tile__badge">{card.courseId ? '📚 課程' : '🧠 問答'}</span>
      <p>{card.question}</p>
      <p className="muted">
        {QUIZ_STAGE_LABEL[card.stage]} · 連對 {card.streak} · {daysLeft <= 0 ? '今天可複習' : `${daysLeft} 天後可複習`}
      </p>
    </>
  );
}

function ReadingCardSummary({ card }: { card: ReadingCard }) {
  return (
    <>
      <span className="card-tile__badge">{card.courseId ? '📚 課程' : '📖 閱讀'}</span>
      <p>{card.title}</p>
      <p className="muted">{card.claimed ? '已完成閱讀' : `共 ${card.pages.length} 頁`}</p>
    </>
  );
}
