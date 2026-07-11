import { NavLink, Route, Routes } from 'react-router-dom';
import WorldMap from './screens/WorldMap';
import Town from './screens/Town';
import BuildingDetail from './screens/BuildingDetail';
import Compendium from './screens/Compendium';

export default function App() {
  return (
    <>
      <header className="top-nav">
        <NavLink to="/" className="brand">
          科技知識苑
        </NavLink>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            世界地圖
          </NavLink>
          <NavLink to="/compendium" className={({ isActive }) => (isActive ? 'active' : '')}>
            圖鑑
          </NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<WorldMap />} />
          <Route path="/map/:mapId" element={<Town />} />
          <Route path="/map/:mapId/domain/:domainId" element={<BuildingDetail />} />
          <Route path="/compendium" element={<Compendium />} />
        </Routes>
      </main>
    </>
  );
}
