import MetricTile from '@/components/MetricTile';
import { useDummy } from '@/context/DummyDataContext';

export default function JustRun() {
  const { metrics } = useDummy();

  const pace = `${Math.floor(metrics.paceSecPerKm / 60)}:${String(
    Math.floor(metrics.paceSecPerKm % 60)
  ).padStart(2, '0')}/km`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <MetricTile label="Speed" value={`${metrics.speedKph.toFixed(1)} kph`} accent="pink" />
      <MetricTile label="Pace" value={pace} accent="orange" />
      <MetricTile label="Distance" value={`${metrics.distanceKm.toFixed(2)} km`} accent="green" />
      <MetricTile label="Time" value={`${metrics.t}s`} />
      <MetricTile label="Heart Rate" value={`${metrics.hrBpm} bpm`} accent="pink" />
      <MetricTile label="Cadence" value={`${metrics.cadenceSpm} spm`} accent="blue" />
      <MetricTile label="Incline" value={`${metrics.inclinePct.toFixed(1)} %`} />
      <MetricTile label="Output" value={`${metrics.powerW} W`} />
    </div>
  );
}
