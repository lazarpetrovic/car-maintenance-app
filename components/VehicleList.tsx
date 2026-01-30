import type { Vehicle } from "@/types/Vehicle";
import VehicleItem from "./VehicleItem";
import { useRouter } from "next/navigation";

interface VehicleListProps {
  vehicles: Vehicle[];
  onAddFirstVehicle?: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
}

export default function VehicleList({ vehicles, onAddFirstVehicle, onEditVehicle }: VehicleListProps) {
  const router = useRouter();

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-slate-900/50 border border-slate-700 rounded-2xl border-dashed">
        <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-slate-200 text-lg font-medium mb-2">No vehicles yet</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">
          Add your first vehicle to start tracking maintenance and costs.
        </p>
        {onAddFirstVehicle && (
          <button
            onClick={onAddFirstVehicle}
            className="bg-teal-500 hover:bg-teal-400 hover:scale-[1.02] active:scale-[0.98] text-slate-900 font-medium px-6 py-3 rounded-xl transition-all duration-200"
          >
            Add your first vehicle
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {vehicles.map((v) => (
        <div
          key={v.id}
          onClick={() => router.push(`/vehicles/${v.id}`)}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:shadow-2xl hover:border-teal-500/30 transition-all duration-200 ease-out hover:-translate-y-1 cursor-pointer"
        >
          <VehicleItem vehicle={v} onEdit={onEditVehicle} />
        </div>
      ))}
    </div>
  );
}
