import React, { useState } from 'react';
import { Bus, MapPin, Phone, Plus, Users, X } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';

export const TransportModule: React.FC = () => {
  const { transportRoutes, addTransportRoute } = useSchoolData();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [routeNumber, setRouteNumber] = useState('Route 3');
  const [routeName, setRouteName] = useState('Central Avenue & West End');
  const [vehicleNumber, setVehicleNumber] = useState('KA-04-E-1824');
  const [driverName, setDriverName] = useState('Gurpreet Singh');
  const [driverPhone, setDriverPhone] = useState('+91 98450 66778');
  const [capacity, setCapacity] = useState(45);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTransportRoute({
      routeNumber,
      routeName,
      vehicleNumber,
      driverName,
      driverPhone,
      capacity: Number(capacity),
      stops: ['Main Station', 'West End Circle', 'Sector 9', 'School Campus'],
    });
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Fleet & Transport Operations</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Bus routes, authorized drivers, vehicle maintenance, and student transit allocations
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bus Route</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {transportRoutes.map((rt) => (
          <div key={rt.id} className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black text-neutral-900 block">{rt.routeNumber}</span>
                <h3 className="text-sm font-bold text-neutral-800 mt-0.5">{rt.routeName}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700">
                {rt.vehicleNumber}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Driver:</span>
                <span className="font-semibold text-neutral-900">{rt.driverName}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Contact:</span>
                <span className="font-mono text-neutral-800">{rt.driverPhone}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Bus Capacity:</span>
                <span className="font-bold tabular-nums text-neutral-900">
                  {rt.assignedStudentsCount} / {rt.capacity} seated
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Designated Pick-up Stops:
              </span>
              <p className="text-xs text-neutral-600 line-clamp-2">
                {rt.stops.join(' → ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Add Transport Route</h3>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Route ID</label>
                  <input
                    type="text"
                    value={routeNumber}
                    onChange={(e) => setRouteNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Vehicle Plate</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Route Name</label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Driver Phone</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-neutral-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
