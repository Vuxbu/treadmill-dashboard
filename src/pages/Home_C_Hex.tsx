import HexagonButton from '@/components/HexagonButton';
import MetricTile from '@/components/MetricTile';
import GearIcon from '@/components/icons/GearIcon';
import { useWS } from '@/context/WebSocketContext';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Build a CSS polygon that "cuts" one corner of a rectangle with a diagonal at a desired angle.
 * We compensate for aspect ratio so the diagonal is truly ~angleDeg in real units (not stretched by CSS percentages).
 *
 * corner: which rectangle corner to cut (tl|tr|br|bl)
 * insetPct: how far (in % of width) the cut intrudes along the horizontal edge
 * ratio: height/width ratio of the tile (e.g., 4/3 -> 1.333...)
 * angleDeg: desired diagonal angle relative to the horizontal (60° for hex aesthetics)
 */
function polygonCutCorner(
  corner: 'tl' | 'tr' | 'br' | 'bl',
  insetPct = 16,
  ratio = 1.3333,
  angleDeg = 60
): string {
  const rad = (Math.PI / 180) * angleDeg;
  const tan = Math.tan(rad); // tan(60°) ≈ 1.732
  // convert horizontal % to vertical % accounting for aspect ratio:
  // dy(%) = dx(%) * tan(theta) * (W/H) => since % are relative, use 1/ratio
  const dx = insetPct; // % of width
  const dy = dx * (tan / ratio); // % of height

  // Clamp to safe ranges
  const DX = Math.max(0, Math.min(30, dx));
  const DY = Math.max(0, Math.min(30, dy));

  // Start from a full rectangle polygon and replace a corner with two points
  switch (corner) {
    case 'tl':
      // cut top-left: replace (0,0) by (DX,0) and (0,DY)
      return `polygon(${DX}% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${DY}%)`;
    case 'tr':
      // cut top-right: replace (100,0) by (100-DX,0) and (100,DY)
      return `polygon(0% 0%, ${100 - DX}% 0%, 100% ${DY}%, 100% 100%, 0% 100%)`;
    case 'br':
      // cut bottom-right: replace (100,100) by (100,100-DY) and (100-DX,100)
      return `polygon(0% 0%, 100% 0%, 100% ${100 - DY}%, ${100 - DX}% 100%, 0% 100%)`;
    case 'bl':
    default:
      // cut bottom-left: replace (0,100) by (DX,100) and (0,100-DY)
      return `polygon(0% 0%, 100% 0%, 100% 100%, ${DX}% 100%, 0% ${100 - DY}%)`;
  }
}

export default function Home() {
  const { connected, devices } = useWS();
  const navigate = useNavigate();

  // Visual controls (tweak to taste)
  const TILE_WIDTH = 280; // px (baseline tile width)
  const RATIO = 16 / 9; // height/width ratio for tile shape & math
  const TILE_HEIGHT = Math.round(TILE_WIDTH / (1 / RATIO)); // derived height
  const CUT_INSET = 16; // % of width to inset the chamfer
  const GAP = 32; // px gap between hexagon and tiles

  const tiles = useMemo(
    () => [
      { key: 'just', title: 'Just Run', path: '/just-run', pos: 'tl', cut: 'br' as const },
      {
        key: 'interval',
        title: 'Interval Training',
        path: '/interval',
        pos: 'tr',
        cut: 'bl' as const,
      },
      { key: 'road', title: 'Road Run', path: '/road-run', pos: 'br', cut: 'tl' as const },
      {
        key: 'threshold',
        title: 'Threshold Training',
        path: '/threshold',
        pos: 'bl',
        cut: 'tr' as const,
      },
    ],
    []
  );

  const posToStyle = (pos: 'tl' | 'tr' | 'br' | 'bl') => {
    // Position the tile’s center on a ring around the hex; then we offset
    // by half the tile size to place it nicely.
    const halfW = TILE_WIDTH / 2;
    const halfH = TILE_HEIGHT / 2;
    const ring = 160 + GAP; // distance from center to tile center

    switch (pos) {
      case 'tl':
        return {
          left: `calc(50% - ${ring}px)`,
          top: `calc(50% - ${ring}px)`,
          transform: `translate(-${halfW}px, -${halfH}px)`,
        };
      case 'tr':
        return {
          left: `calc(50% + ${ring}px)`,
          top: `calc(50% - ${ring}px)`,
          transform: `translate(-${halfW}px, -${halfH}px)`,
        };
      case 'br':
        return {
          left: `calc(50% + ${ring}px)`,
          top: `calc(50% + ${ring}px)`,
          transform: `translate(-${halfW}px, -${halfH}px)`,
        };
      case 'bl':
      default:
        return {
          left: `calc(50% - ${ring}px)`,
          top: `calc(50% + ${ring}px)`,
          transform: `translate(-${halfW}px, -${halfH}px)`,
        };
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 overflow-hidden">
      {/* Floating Settings */}
      <Link
        to="/settings"
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-ui-accent hover:text-black transition z-50"
        aria-label="Settings"
      >
        <GearIcon className="w-6 h-6" />
      </Link>

      {/* Centered Hexagon */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div
          className={
            connected && devices.runSpeed && devices.cadence && devices.heartRate
              ? 'rounded-full animate-pulseGlow'
              : ''
          }
        >
          <HexagonButton
            label={
              connected && devices.runSpeed && devices.cadence && devices.heartRate
                ? 'Connected'
                : 'Scan for devices'
            }
            onClick={() => {
              const e = new CustomEvent('open-scan');
              window.dispatchEvent(e);
            }}
          />
        </div>
      </div>

      {/* Four chamfered tiles around hex */}
      {tiles.map(({ key, title, path, pos, cut }) => (
        <div
          key={key}
          className="absolute z-10"
          style={{
            width: `${TILE_WIDTH}px`,
            height: `${TILE_HEIGHT}px`,
            ...posToStyle(pos as any),
            clipPath: polygonCutCorner(cut, CUT_INSET, RATIO, 60),
          }}
        >
          <MetricTile
            label={title}
            locked={!connected}
            onClick={() => connected && navigate(path)}
            className="h-full w-full"
          />
        </div>
      ))}

      {/* Optional: subtle radial vignette for drama */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
    </div>
  );
}
