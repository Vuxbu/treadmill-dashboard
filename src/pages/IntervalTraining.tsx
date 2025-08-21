import MetricTile from '@/components/MetricTile';
import { useDummy } from '@/context/DummyDataContext';

function TrackSVG({ progress }: { progress: number }) {
  // progress 0..1 mapped to a rounded rectangle path (simplified oval)
  // We'll render a base track and a progress stroke.
  const P = 2 * Math.PI * 40 + 2 * (220 - 2 * 40); // approx perimeter of rounded rect (rx=40, w=220, h=120)
  const dash = `${progress * P} ${P}`;

  return (
    <svg viewBox="0 0 260 160" className="w-full">
      <defs>
        <linearGradient id="lap" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#ef476f" />
        </linearGradient>
      </defs>
      <rect
        x="20"
        y="20"
        width="220"
        height="120"
        rx="60"
        ry="60"
        fill="none"
        stroke="#2a2d31"
        strokeWidth="20"
      />
      <rect
        x="20"
        y="20"
        width="220"
        height="120"
        rx="60"
        ry="60"
        fill="none"
        stroke="#3b4046"
        strokeWidth="6"
      />
      <rect
        x="20"
        y="20"
        width="220"
        height="120"
        rx="60"
        ry="60"
        fill="none"
        stroke="url(#lap)"
        strokeWidth="6"
        strokeDasharray={dash}
        strokeLinecap="round"
      />
      <text
        x="130"
        y="85"
        textAnchor="middle"
        className="fill-white/80"
        style={{ fontSize: '22px' }}
      >
        LAP
      </text>
    </svg>
  );
}

export default function IntervalTraining() {
  const { metrics } = useDummy();
  // 400m lap progress based on distance
  const meters = metrics.distanceKm * 1000;
  const progress = (meters % 400) / 400;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="panel col-span-2 p-6 flex flex-col items-center">
        <div className="w-full">
          <TrackSVG progress={progress} />
        </div>
        <div className="mt-2 text-white/70">Lap Progress: {(progress * 100).toFixed(0)}%</div>
      </div>
      <div className="grid gap-4">
        <MetricTile label="Heart Rate" value={`${metrics.hrBpm} bpm`} accent="pink" />
        <MetricTile label="Cadence" value={`${metrics.cadenceSpm} spm`} accent="orange" />
        <MetricTile
          label="Pace"
          value={`${Math.floor(metrics.paceSecPerKm / 60)}:${String(
            Math.floor(metrics.paceSecPerKm % 60)
          ).padStart(2, '0')}/km`}
        />
        <MetricTile label="Speed" value={`${metrics.speedKph.toFixed(1)} kph`} accent="pink" />
        <MetricTile label="Distance" value={`${metrics.distanceKm.toFixed(2)} km`} />
      </div>
    </div>
  );
}
