import { NavLink, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import HomeHex from './pages/Home_C_Hex';
import IntervalTraining from './pages/IntervalTraining';
import JustRun from './pages/JustRun';
import RoadRun from './pages/RoadRun';
import Settings from './pages/Settings';
import ThresholdTraining from './pages/ThresholdTraining';

export default function App() {
  return (
    <div className="min-h-screen bg-ui-bg">
      <Header />
      <nav className="mx-auto max-w-6xl px-4 pt-2 pb-4 flex gap-3 text-sm">
        {[
          ['/', 'Home'],
          ['/Settings', 'Settings'],
          ['/HomeHex', 'HomeHex'],
          /*
          ['/interval', 'Interval'],
          ['/threshold', 'Threshold'],
          ['/road', 'Road Run'],
          ['/just', 'Just Run'],
          */
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3 py-1 rounded-md ${
                isActive ? 'bg-ui-accent text-black' : 'bg-white/5 hover:bg-white/10'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="mx-auto max-w-6xl px-4 pb-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interval" element={<IntervalTraining />} />
          <Route path="/threshold" element={<ThresholdTraining />} />
          <Route path="/road" element={<RoadRun />} />
          <Route path="/just" element={<JustRun />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/HomeHex" element={<HomeHex />} />
        </Routes>
      </main>
    </div>
  );
}
