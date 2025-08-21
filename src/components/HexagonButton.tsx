type HexagonButtonProps = {
  label: string;
  onClick?: () => void;
  active?: boolean;
};

export default function HexagonButton({ label, onClick, active = false }: HexagonButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-32 h-28 flex items-center justify-center text-center font-bold uppercase tracking-wide transition
        ${active ? 'bg-green-500 text-black' : 'bg-ui-accent text-black'}
      `}
      style={{
        clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
      }}
    >
      {label}
      {active && (
        <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
          ✓
        </span>
      )}
    </button>
  );
}
