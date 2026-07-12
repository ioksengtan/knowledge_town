import { useGameStore, cardsForDomain, domainsForMap } from '../game/store';
import { CATEGORY_LABEL, QUIZ_STAGE_LABEL } from '../game/logic';

export default function Compendium() {
  const maps = useGameStore((s) => s.maps);
  const domains = useGameStore((s) => s.domains);
  const cards = useGameStore((s) => s.cards);

  const mapList = Object.values(maps).sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div>
      <h1>圖鑑</h1>
      <p className="muted">依地圖分組，列出所有已開拓的知識卡片。</p>

      {mapList.map((map) => {
        const ds = domainsForMap(domains, map.id);
        return (
          <div key={map.id} className="panel compendium-map">
            <h2>{map.name}</h2>
            {ds.map((d) => {
              const dCards = cardsForDomain(cards, d.id);
              return (
                <div key={d.id} className="compendium-domain">
                  <h3>{CATEGORY_LABEL[d.category]} · {d.buildingName} · {d.name}</h3>
                  <div className="compendium-cards">
                    {dCards.map((c) => (
                      <span key={c.id} className={`compendium-chip ${cardDone(c) ? 'compendium-chip--done' : ''}`}>
                        {c.type === 'quiz'
                          ? `🧠 ${c.question.slice(0, 12)}… ${QUIZ_STAGE_LABEL[c.stage]}`
                          : `📖 ${c.title}`}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function cardDone(c: { type: string; claimed: boolean }) {
  return c.claimed;
}
