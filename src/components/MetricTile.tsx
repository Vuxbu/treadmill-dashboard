type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'blue' | 'green' | 'orange' | 'pink';
};

const accentMap = {
  blue: 'from-sky-500/40 to-sky-400/10',
  green: 'from-emerald-500/40 to-emerald-400/10',
  orange: 'from-orange-500/40 to-amber-400/10',
  pink: 'from-pink-500/40 to-fuchsia-400/10',
};

export default function MetricTile({ label, value, hint, accent = 'blue' }: Props) {
  return (
    <div className={`panel p-4 bg-gradient-to-b ${accentMap[accent]}`}>
      <div className="text-xs uppercase tracking-wider text-white/60">{label}</div>
      <div className="text-3xl font-bold metric">{value}</div>
      {hint && <div className="text-xs text-white/60 mt-1">{hint}</div>}
    </div>
  );
}
