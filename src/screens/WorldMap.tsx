import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, domainsForMap } from '../game/store';
import { appearanceStage, MAX_APPEARANCE_LEVEL } from '../game/logic';
import { gridPosition, isoBounds, isoToScreen } from '../game/iso';

const ISLAND_TILE_W = 260;
const ISLAND_TILE_H = 260;

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

  const slotCount = mapList.length + 1; // +1 for the "add new map" tile
  const positions = Array.from({ length: slotCount }, (_, i) => gridPosition(i, slotCount));
  const bounds = isoBounds(positions, ISLAND_TILE_W, ISLAND_TILE_H);

  function tileStyle(index: number) {
    const { x, y } = isoToScreen(positions[index], ISLAND_TILE_W, ISLAND_TILE_H);
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
    } as const;
  }

  return (
    <div>
      <h1>世界地圖</h1>
      <p className="muted">每一座島＝一張完全獨立的城鎮地圖，資源與建設互不相通。</p>

      <div className="iso-canvas-scroll">
        <div className="iso-canvas iso-canvas--world" style={{ minWidth: bounds.width, height: bounds.height }}>
          {mapList.map((map, i) => {
            const pct = completion(map.id, map.townHallLevel);
            return (
              <div
                key={map.id}
                className="iso-tile island-tile"
                style={tileStyle(i)}
                onClick={() => navigate(`/map/${map.id}`)}
              >
                <div className="island-tile__diamond">
                  <span>{map.townHallLevel >= MAX_APPEARANCE_LEVEL ? '🏛️' : '🏗️'}</span>
                </div>
                <div className="island-tile__card panel">
                  <h3>{map.name}</h3>
                  <p className="muted">總部 Lv.{map.townHallLevel} · {domainsForMap(domains, map.id).length} 棟建築</p>
                  <div className="progress-bar">
                    <div style={{ width: `${pct}%` }} />
                  </div>
                  <p className="muted">完工度 {pct}%</p>
                </div>
              </div>
            );
          })}

          <div
            className="iso-tile island-tile island-tile--new"
            style={tileStyle(mapList.length)}
            onClick={() => setShowNew(true)}
          >
            <div className="island-tile__diamond island-tile__diamond--new">＋</div>
            <div className="island-tile__card panel">
              <p>新增地圖</p>
            </div>
          </div>
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
