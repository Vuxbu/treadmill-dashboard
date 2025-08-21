import { useDummy } from '@/context/DummyDataContext';
import { useWS } from '@/context/WebSocketContext';
import { Link } from 'react-router-dom';

function formatPace(secPerKm: number) {
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}/km`;
}

export default function Header() {
  const { metrics } = useDummy();
  const { connected, devices, disconnect } = useWS();

  return (
    <header className="sticky top-0 z-10 bg-ui-bg/90 backdrop-blur border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold tracking-wide">
          <span className="text-ui-accent">W</span>Run
        </Link>
        <div className="flex gap-6 text-sm">
          <div className="metric">
            Time <span className="font-bold">{metrics.t}s</span>
          </div>
          <div className="metric">
            Dist <span className="font-bold">{metrics.distanceKm.toFixed(2)} km</span>
          </div>
          <div className="metric">
            Speed <span className="font-bold">{metrics.speedKph.toFixed(1)} kph</span>
          </div>
          <div className="metric">
            Pace <span className="font-bold">{formatPace(metrics.paceSecPerKm)}</span>
          </div>
          <div className="metric">
            HR <span className="font-bold">{metrics.hrBpm} bpm</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {connected ? (
            <>
              <span className="text-xs text-white/70">
                {devices?.treadmill?.name ?? 'Treadmill'} • {devices?.hrm?.name ?? 'HRM'}
              </span>
              <button
                onClick={disconnect}
                className="px-3 py-1 rounded-md bg-red-500 text-white text-sm"
              >
                Disconnect
              </button>
            </>
          ) : (
            <span className="text-xs text-white/50">Not connected</span>
          )}
        </div>
      </div>
    </header>
  );
}
