type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'blue' | 'green' | 'orange' | 'pink';
};

interface MetricTileProps {
  title?: string; // add this
  locked?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const accentMap = {
  blue: 'from-sky-500/40 to-sky-400/10',
  green: 'from-emerald-500/40 to-emerald-400/10',
  orange: 'from-orange-500/40 to-amber-400/10',
  pink: 'from-pink-500/40 to-fuchsia-400/10',
};

export default function MetricTile({
  title,
  locked,
  onClick,
  className,
  children,
}: MetricTileProps) {
  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 cursor-pointer ${locked ? 'opacity-50' : ''} ${
        className || ''
      }`}
      onClick={onClick}
    >
      {title && <h3 className="text-white text-lg font-bold mb-2">{title}</h3>}
      {children}
    </div>
  );
}
