import HexagonButton from '@/components/HexagonButton';
import Modal from '@/components/Modal';
import { useDummy } from '@/context/DummyDataContext';
import { useWS } from '@/context/WebSocketContext';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import BluetoothIcon from '@/components/icons/BluetoothIcon';
import CadenceIcon from '@/components/icons/CadenceIcon';
/* import GearIcon from '@/components/icons/GearIcon'; */
import Roadrun from '@/assets/Bekele.jpeg';
import Threshold from '@/assets/Threshold.png';
import Track from '@/assets/track.jpg';
import Woodway from '@/assets/Woodway4front.jpeg';
import HeartIcon from '@/components/icons/HeartIcon';
import RunIcon from '@/components/icons/RunIcon';

export default function Home() {
  const { connectMock, connected, devices } = useWS();
  const { setSessionType } = useDummy();

  const [scanOpen, setScanOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const deviceCatalog = {
    runSpeed: [{ name: 'WOODWAY Pro (Mock)', id: 'tm-001' }],
    cadence: [{ name: 'Garmin HRM Pro (Mock)', id: 'hr-001' }],
    heartRate: [{ name: 'Garmin HRM Pro (Mock)', id: 'hr-001' }],
  };

  useEffect(() => {
    if (scanOpen) {
      setIsScanning(true);
      const timer = setTimeout(() => {
        setIsScanning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanOpen]);

  const handleSelect = (
    category: keyof typeof deviceCatalog,
    device: { name: string; id: string }
  ) => {
    connectMock({
      ...devices,
      [category]: device,
    });
  };

  const go = (to: string, type: Parameters<typeof setSessionType>[0]) => {
    setSessionType(type);
    return to;
  };
  const Tile = ({
    to,
    type,
    label,
    img,
  }: {
    to: string;
    type: Parameters<typeof setSessionType>[0];
    label: string;
    img: string;
  }) => {
    const locked = !connected;
    const content = (
      <div
        className={`panel p-4 transition relative ${
          locked ? 'opacity-40 cursor-not-allowed' : 'hover:ring-2 ring-ui-accent/60'
        }`}
      >
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs font-bold uppercase tracking-wide">
            Locked
          </div>
        )}
        <div className="text-white/70 mb-2">{label}</div>
        <div
          className="h-28 rounded-lg"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
    );
    return locked ? content : <Link to={go(to, type)}>{content}</Link>;
  };
  const renderCategory = (
    label: string,
    Icon: React.FC<{ className?: string }>,
    category: keyof typeof deviceCatalog
  ) => {
    return (
      <div className="panel p-4 flex flex-col items-center gap-3">
        <Icon className="w-8 h-8 text-ui-accent" />
        <div className="text-sm font-semibold">{label}</div>
        {isScanning ? (
          <div className="flex flex-col items-center justify-center py-4 text-white/70">
            <div className="relative mb-2">
              <div className="absolute inset-0 rounded-full border-4 border-ui-accent opacity-30 animate-ping"></div>
              <BluetoothIcon className="w-6 h-6 text-ui-accent animate-pulse relative z-10" />
            </div>
            <div className="w-6 h-6 border-4 border-ui-accent border-t-transparent rounded-full animate-spin mb-1"></div>
            Searching...
          </div>
        ) : devices[category] ? (
          <div
            className="p-2 px-3 bg-ui-accent text-black rounded cursor-pointer hover:bg-ui-accent/80 shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse"
            onClick={() => handleSelect(category, devices[category]!)}
          >
            {devices[category]!.name}
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {deviceCatalog[category].map((dev, idx) => (
              <div
                key={dev.id}
                onClick={() => handleSelect(category, dev)}
                className="p-2 px-3 bg-white/5 rounded cursor-pointer hover:bg-ui-accent hover:text-black transition-opacity"
                style={{ animation: `fadeIn 0.5s ease forwards`, animationDelay: `${idx * 0.15}s` }}
              >
                {dev.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      {/* LEFT */}
      <div className={`panel p-6 ${connected ? 'ring-2 ring-ui-accent/60' : ''}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">TRAINING</h2>
          <div className="text-xs text-white/60">
            {connected ? 'Connected' : 'Tap SCAN to connect'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mt-6">
          <Tile to="/just" type="just" label="Just Run" img={Woodway} />
          <Tile to="/interval" type="interval" label="Interval Training" img={Track} />
          <Tile to="/road" type="road" label="Road Run" img={Roadrun} />
          <Tile to="/threshold" type="threshold" label="Threshold Training" img={Threshold} />
        </div>
      </div>

      {/* RIGHT: Hexagon scanner */}
      <div className="panel p-6 flex flex-col items-center justify-center">
        <div className="text-sm uppercase tracking-widest text-white/70 mb-2">Center Console</div>
        <HexagonButton
          label={
            connected && devices.runSpeed && devices.cadence && devices.heartRate
              ? 'Connected'
              : 'Scan for devices'
          }
          onClick={() => setScanOpen(true)}
          active={!!(devices.runSpeed && devices.cadence && devices.heartRate)}
        />
        <div className="mt-4 text-white/70 text-sm">
          Click <span className="font-semibold text-ui-accent">SCAN</span> to connect Treadmill &
          HRM.
        </div>
      </div>

      {/* SCAN MODAL */}
      <Modal
        title="Device Pairing"
        isOpen={scanOpen}
        onClose={() => {
          // Auto-connect if all devices are paired
          if (devices.runSpeed && devices.cadence && devices.heartRate) {
            connectMock({
              runSpeed: devices.runSpeed,
              cadence: devices.cadence,
              heartRate: devices.heartRate,
            });
          }
          setScanOpen(false);
        }}
      >
        <div className="grid grid-cols-3 gap-4">
          {renderCategory('Run Speed', RunIcon, 'runSpeed')}
          {renderCategory('Cadence', CadenceIcon, 'cadence')}
          {renderCategory('Heart Rate', HeartIcon, 'heartRate')}
        </div>
      </Modal>
    </div>
  );
}
