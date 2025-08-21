import Modal from '@/components/Modal';
import { useWS } from '@/context/WebSocketContext';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Category = 'runSpeed' | 'cadence' | 'heartRate';

const labelFor = (c: Category) =>
  c === 'runSpeed' ? 'Run Speed' : c === 'cadence' ? 'Cadence' : 'Heart Rate';

export default function Settings() {
  const { devices, connected, disconnect, pairSingleDevice } = useWS();

  const [scanOpen, setScanOpen] = useState(false);
  const [scanCategory, setScanCategory] = useState<Category | null>(null);

  // Dummy device lists per category (can be replaced by real scan later)
  const fakeLists: Record<Category, { name: string; id: string }[]> = useMemo(
    () => ({
      runSpeed: [{ name: 'WOODWAY Pro (Mock)', id: 'tm-001' }],
      cadence: [
        { name: 'Garmin HRM Pro (Mock)', id: 'hr-001' },
        { name: 'Stryd Footpod (Mock)', id: 'fp-001' },
      ],
      heartRate: [
        { name: 'Garmin HRM Pro (Mock)', id: 'hr-001' },
        { name: 'Polar H10 (Mock)', id: 'hr-002' },
      ],
    }),
    []
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {/* Connection Status */}
      <div className="mb-6 flex items-center gap-2">
        <div className="text-white/70">Connection Status:</div>
        <div
          className={`font-semibold flex items-center gap-2 ${
            connected ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {connected ? 'Connected' : 'Not Connected'}
          {connected && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}
        </div>
      </div>

      {/* Paired Devices (click to re-pair) */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Paired Devices</h2>
        <ul className="space-y-2">
          {(['runSpeed', 'cadence', 'heartRate'] as Category[]).map((cat) => (
            <li
              key={cat}
              className={`cursor-pointer ${
                devices[cat]
                  ? 'text-green-300 drop-shadow-[0_0_6px_rgba(34,197,94,0.8)]'
                  : 'text-white/70'
              }`}
              onClick={() => {
                setScanCategory(cat);
                setScanOpen(true);
              }}
            >
              <span className="text-white/70">{labelFor(cat)}:</span> {devices[cat]?.name || '—'}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link to="/" className="px-4 py-2 bg-ui-accent text-black rounded hover:bg-ui-accent/80">
          Re-Pair Devices
        </Link>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>

      {/* Single-category scan modal */}
      <Modal
        title={`Scan for ${scanCategory ? labelFor(scanCategory) : ''}`}
        isOpen={scanOpen}
        onClose={() => setScanOpen(false)}
      >
        {scanCategory && (
          <div className="space-y-2">
            {fakeLists[scanCategory].map((dev, idx) => (
              <div
                key={dev.id}
                className="p-2 px-3 bg-white/5 rounded cursor-pointer hover:bg-ui-accent hover:text-black transition"
                style={{ animation: 'fadeIn 0.5s ease forwards', animationDelay: `${idx * 0.15}s` }}
                onClick={() => {
                  pairSingleDevice(scanCategory, dev);
                  setScanOpen(false);
                }}
              >
                {dev.name}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
