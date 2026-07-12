import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BuildingSprite from '../components/BuildingSprite';
import ResourceBar from '../components/ResourceBar';
import VillagerLayer from '../components/VillagerLayer';
import { useGameStore, domainsForMap } from '../game/store';
import {
  canAfford,
  CATEGORY_LABEL,
  expansionCost,
  formatCost,
  INITIAL_LAND_CAPACITY,
  LAND_PER_EXPANSION,
  splitCost,
  upgradeCost,
} from '../game/logic';
import { generateVillagerSpots, isoBounds, isoToScreen, ringPosition, type ExclusionRect, type GridPos } from '../game/iso';

const TOWN_HALL_POS: GridPos = { col: 0, row: 0 };

export default function Town() {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const map = useGameStore((s) => (mapId ? s.maps[mapId] : undefined));
  const domains = useGameStore((s) => s.domains);
  const upgradeTownHall = useGameStore((s) => s.upgradeTownHall);
  const addDomain = useGameStore((s) => s.addDomain);
  const expandLand = useGameStore((s) => s.expandLand);

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const ds = useMemo(() => (map ? domainsForMap(domains, map.id) : []), [domains, map]);

  const totalSlots = map?.landCapacity.total ?? 0;
  const slotPositions = useMemo(
    () => Array.from({ length: totalSlots }, (_, i) => ringPosition(i + 1)),
    [totalSlots]
  );
  const bounds = useMemo(() => isoBounds([TOWN_HALL_POS, ...slotPositions]), [slotPositions]);

  // Villagers are purely decorative (spec 5.11) — count scales with overall
  // development, no data model involved. Formula is this implementation's
  // default; see docs/implementation-decisions.md.
  const villagerCount = map
    ? Math.min(10, Math.max(1, Math.floor((map.townHallLevel + ds.reduce((sum, d) => sum + d.level, 0)) / 3)))
    : 0;

  // Villagers must never render on top of a building or its label — spots
  // are rejection-sampled against every occupied tile's real bounding box
  // (sprite + label), so overlap isn't possible by construction.
  const villagerSpots = useMemo(() => {
    if (!map) return [];
    const exclusions: ExclusionRect[] = [];
    const thScreen = isoToScreen(TOWN_HALL_POS);
    exclusions.push({ x: thScreen.x, y: thScreen.y, halfWidth: 60, top: 185, bottom: 15 });
    slotPositions.forEach((pos, i) => {
      if (!ds.find((dd) => dd.slotIndex === i)) return;
      const { x, y } = isoToScreen(pos);
      exclusions.push({ x, y, halfWidth: 55, top: 170, bottom: 15 });
    });
    const spots = generateVillagerSpots(villagerCount, bounds, exclusions);
    return spots.map((s) => ({ ...s, duration: 5 + Math.random() * 5, delay: Math.random() * 4 }));
  }, [map, villagerCount, bounds, slotPositions, ds]);

  if (!map) {
    return (
      <div>
        <p>找不到這張地圖。</p>
        <button className="btn" onClick={() => navigate('/')}>回世界地圖</button>
      </div>
    );
  }

  const hallCost = splitCost(upgradeCost(map.townHallLevel));
  const expansionsSoFar = Math.round((map.landCapacity.total - INITIAL_LAND_CAPACITY) / LAND_PER_EXPANSION);
  const expandCost = splitCost(expansionCost(expansionsSoFar));
  const landFull = map.landCapacity.used >= map.landCapacity.total;

  function handleAddDomain() {
    if (!newName.trim()) return;
    const id = addDomain(map!.id, newName.trim(), newDesc.trim() || '新開拓的知識領域。');
    setShowAdd(false);
    setNewName('');
    setNewDesc('');
    if (id) navigate(`/map/${map!.id}/domain/${id}`);
  }

  function tileStyle(pos: GridPos, zBoost = 0) {
    const { x, y } = isoToScreen(pos);
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      zIndex: 1000 + pos.row * 4 - pos.col + zBoost,
    } as const;
  }

  return (
    <div>
      <div className="town-header">
        <div>
          <h1>{map.name}</h1>
          <p className="muted">地塊 {map.landCapacity.used} / {map.landCapacity.total}</p>
        </div>
        <ResourceBar resources={map.resources} />
      </div>

      <div className="panel town-hall-card">
        <BuildingSprite category="townhall" level={map.townHallLevel} size={72} label="總部" />
        <div style={{ flex: 1 }}>
          <h3>總部（Town Hall）Lv.{map.townHallLevel}</h3>
          <p className="muted">
            總部等級是這張地圖所有建築的等級天花板——任何建築都不能升到超過總部目前等級。
          </p>
        </div>
        <button className="btn btn-primary" disabled={!canAfford(map.resources, hallCost)} onClick={() => upgradeTownHall(map.id)}>
          升級總部（{formatCost(hallCost)}）
        </button>
      </div>

      <div className="land-grid-header">
        <h3>城鎮可建地</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => expandLand(map.id)} disabled={!canAfford(map.resources, expandCost)}>
            擴地 +{LAND_PER_EXPANSION}（{formatCost(expandCost)}）
          </button>
          <button className="btn btn-primary" disabled={landFull} onClick={() => setShowAdd(true)}>
            新建領域
          </button>
        </div>
      </div>

      <div className="iso-canvas-scroll">
        <div className="iso-canvas" style={{ minWidth: bounds.width, height: bounds.height }}>
          <VillagerLayer spots={villagerSpots} />

          <div className="iso-tile iso-tile--townhall" style={tileStyle(TOWN_HALL_POS, 500)}>
            <BuildingSprite category="townhall" level={map.townHallLevel} size={60} />
            <span className="iso-tile__label">總部 Lv.{map.townHallLevel}</span>
          </div>

          {slotPositions.map((pos, i) => {
            const d = ds.find((dd) => dd.slotIndex === i);
            if (!d) {
              return (
                <div key={i} className="iso-tile iso-tile--empty" style={tileStyle(pos)}>
                  <div className="ground-tile" />
                </div>
              );
            }
            const capped = d.level >= map.townHallLevel;
            return (
              <div
                key={i}
                className="iso-tile"
                style={tileStyle(pos)}
                onClick={() => navigate(`/map/${map.id}/domain/${d.id}`)}
              >
                <BuildingSprite category={d.category} level={d.level} size={46} label={d.buildingName} />
                <span className="iso-tile__label">
                  <strong>{d.buildingName}</strong>
                  <br />
                  <span className="iso-tile__label-sub">{d.name}</span>
                  <br />
                  Lv.{d.level} {capped && '🔒'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="panel modal-panel" style={{ width: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3>新建領域</h3>
            <p className="muted">
              系統會依名稱自動指派分類（{Object.values(CATEGORY_LABEL).join(' / ')}），決定造型，並自動取一個城鎮建築名稱（例如「糧倉」「研究所」）——這個名稱跟你輸入的知識主題名稱是分開的兩件事。
            </p>
            <input
              className="text-input"
              placeholder="領域名稱，例如：量子運算"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <textarea
              className="text-input"
              placeholder="簡短描述（選填）"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={3}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowAdd(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAddDomain} disabled={!newName.trim()}>
                建立
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
