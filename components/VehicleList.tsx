import type { Vehicle } from "@/types/Vehicle";
import VehicleItem from "./VehicleItem";
import { useRouter } from "next/navigation";

interface VehicleListProps {
  vehicles: Vehicle[];
}

export default function VehicleList({ vehicles }: VehicleListProps) {
  const router = useRouter();

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-900 border border-slate-700 rounded-2xl">
        <div className="text-slate-300 text-lg font-medium mb-2">
          No vehicles found
        </div>
        <p className="text-slate-500 text-sm">
          Add your first vehicle to start tracking maintenance.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {vehicles.map((v) => (
        <div
          key={v.id}
          onClick={() => router.push(`/vehicles/${v.id}`)}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 ease-out hover:-translate-y-2 cursor-pointer"
        >
          <VehicleItem vehicle={v} />
        </div>
      ))}
    </div>
  );
}
