import MetricTile from '@/components/MetricTile';
import { useDummy } from '@/context/DummyDataContext';
import { latLng, LatLngExpression } from 'leaflet';
import { useMemo } from 'react';
import { MapContainer, Polyline, TileLayer } from 'react-leaflet';

export default function RoadRun() {
  const { metrics } = useDummy();

  // Dummy loop around a park (rough coords)
  const route: LatLngExpression[] = useMemo(() => {
    const c = latLng(40.771133, -73.974187); // Central Park-ish
    const r = 0.01;
    const pts: LatLngExpression[] = [];
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 32) {
      pts.push([c.lat + Math.sin(a) * r, c.lng + Math.cos(a) * r]);
    }
    return pts;
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div className="panel col-span-2 overflow-hidden">
        <MapContainer
          center={[40.771133, -73.974187]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: 420 }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={route} pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.8 }} />
        </MapContainer>
      </div>
      <div className="grid gap-4">
        <MetricTile label="Distance" value={`${metrics.distanceKm.toFixed(2)} km`} accent="green" />
        <MetricTile label="Speed" value={`${metrics.speedKph.toFixed(1)} kph`} accent="blue" />
        <MetricTile label="Heart Rate" value={`${metrics.hrBpm} bpm`} accent="pink" />
        <MetricTile label="Cadence" value={`${metrics.cadenceSpm} spm`} accent="orange" />
      </div>
    </div>
  );
}
