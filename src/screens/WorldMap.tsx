import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, domainsForMap } from '../game/store';
import { appearanceStage, MAX_APPEARANCE_LEVEL } from '../game/logic';

export default function WorldMap() {
  const maps = useGameStore((s) => s.maps);
  const domains = useGameStore((s) => s.domains);
  const createMap = useGameStore((s) => s.createMap);
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');

  const mapList = Object.values(maps).sort((a, b) => a.createdAt - b.createdAt);

  function completion(mapId: string, townHallLevel: number) {
    const ds = domainsForMap(domains, mapId);
    if (ds.length === 0) return 0;
    const done = ds.filter((d) => appearanceStage(d.level) >= 5).length;
    const hallDone = appearanceStage(townHallLevel) >= 5 ? 1 : 0;
    return Math.round(((done + hallDone) / (ds.length + 1)) * 100);
  }

  function handleCreate() {
    const trimmed = name.trim() || `新城鎮 ${mapList.length + 1}`;
    const id = createMap(trimmed);
    setShowNew(false);
    setName('');
    navigate(`/map/${id}`);
  }

  return (
    <div>
      <h1>世界地圖</h1>
      <p className="muted">每一座島＝一張完全獨立的城鎮地圖，資源與建設互不相通。</p>

      <div className="island-grid">
        {mapList.map((map) => {
          const pct = completion(map.id, map.townHallLevel);
          return (
            <div key={map.id} className="island-tile panel" onClick={() => navigate(`/map/${map.id}`)}>
              <div className="island-tile__diamond">
                <span>{map.townHallLevel >= MAX_APPEARANCE_LEVEL ? '🏛️' : '🏗️'}</span>
              </div>
              <h3>{map.name}</h3>
              <p className="muted">總部 Lv.{map.townHallLevel} · {domainsForMap(domains, map.id).length} 棟建築</p>
              <div className="progress-bar">
                <div style={{ width: `${pct}%` }} />
              </div>
              <p className="muted">完工度 {pct}%</p>
            </div>
          );
        })}

        <div className="island-tile island-tile--new panel" onClick={() => setShowNew(true)}>
          <div className="island-tile__diamond island-tile__diamond--new">＋</div>
          <p>新增地圖</p>
        </div>
      </div>

      {showNew && (
        <div className="modal-backdrop" onClick={() => setShowNew(false)}>
          <div className="panel modal-panel" style={{ width: 360 }} onClick={(e) => e.stopPropagation()}>
            <h3>新增城鎮地圖</h3>
            <input
              className="text-input"
              placeholder="幫這座城鎮取個名字"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowNew(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleCreate}>建立</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
