import { useDummy } from '@/context/DummyDataContext';
import { useMemo } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Block = { i: number; watts: number; zone: 'warm' | 'tempo' | 'threshold' | 'rest' };

export default function ThresholdTraining() {
  const { metrics } = useDummy();

  const data = useMemo<Block[]>(() => {
    // Zwift-like bars: warmup, alternating efforts, cooldown
    const arr: Block[] = [];
    const seq = [120, 160, 200, 240, 260, 240, 260, 240, 260, 220, 180, 140];
    seq.forEach((w, i) =>
      arr.push({
        i,
        watts: w + Math.round(15 * Math.sin((metrics.t + i * 5) / 7)),
        zone: w < 150 ? 'warm' : w < 210 ? 'tempo' : w < 250 ? 'threshold' : 'rest', // just for colors
      })
    );
    return arr;
  }, [metrics.t]);

  const color = (z: Block['zone']) =>
    z === 'warm'
      ? '#3b82f6'
      : z === 'tempo'
      ? '#22c55e'
      : z === 'threshold'
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="panel p-6 mt-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-black">0:{String(metrics.t % 60).padStart(2, '0')}</div>
          <div className="uppercase tracking-wider text-white/60 text-sm">Duration</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black">{metrics.distanceKm.toFixed(1)}km</div>
          <div className="uppercase tracking-wider text-white/60 text-sm">Distance</div>
        </div>
      </div>

      <div className="h-64 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="i" hide />
            <YAxis hide domain={[0, 300]} />
            <Tooltip
              contentStyle={{
                background: '#1a1d20',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
            />
            <Bar dataKey="watts" radius={[6, 6, 0, 0]} fill="#ef4444">
              {data.map((d, idx) => (
                <Cell key={idx} fill={color(d.zone)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
