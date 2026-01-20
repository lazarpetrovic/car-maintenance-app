"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Vehicle } from "@/types/Vehicle";
import { brandLogos } from "@/utils/brandLogos";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function VehicleDetailsPage() {
  const { vehicleId } = useParams();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) return;

      const ref = doc(db, "vehicles", vehicleId as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as Vehicle;

        setVehicle({
          ...data,
          id: snap.id,
        });
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-300">
        Loading vehicle...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* BACK HEADER */}
      <header className="px-6 py-4 flex items-center bg-slate-900 border-b border-slate-800">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition font-medium"
        >
          <span className="text-xl">←</span>
          Back to My Vehicles
        </button>
      </header>

      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* VEHICLE HEADER */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-lg">
            {brandLogos[vehicle.make] && (
              <Image
                src={brandLogos[vehicle.make]}
                alt={vehicle.make}
                width={70}
                height={70}
                className="object-contain"
              />
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-medium text-white tracking-tight">
                {vehicle.make} {vehicle.model}
              </h1>
              <p className="text-slate-400">
                {vehicle.year} • {vehicle.plateNumber}
              </p>
            </div>

            <div className="text-slate-400 text-sm space-y-1">
              <p>
                <span className="text-slate-300">VIN:</span> {vehicle.vin}
              </p>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* VEHICLE SPECIFICATIONS */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-medium text-white mb-4">
                Vehicle Specifications
              </h2>

              <ul className="text-slate-400 space-y-3">
                <li>
                  <span className="text-slate-300 font-medium">Engine:</span>{" "}
                  {vehicle.engineType}
                </li>
                <li>
                  <span className="text-slate-300 font-medium">
                    Transmission:
                  </span>{" "}
                  {vehicle.transmission}
                </li>
                <li>
                  <span className="text-slate-300 font-medium">
                    Drivetrain:
                  </span>{" "}
                  {vehicle.drivetrain}
                </li>
                <li>
                  <span className="text-slate-300 font-medium">Plate:</span>{" "}
                  {vehicle.plateNumber}
                </li>
              </ul>
            </div>

            {/* SUMMARY */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-medium text-white mb-4">
                Vehicle Summary
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Last Service</p>
                  <p className="text-slate-200 font-medium">Not recorded</p>
                </div>

                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-slate-400 text-sm">Total Spent</p>
                  <p className="text-slate-200 font-medium">€0.00</p>
                </div>
              </div>
            </div>

            {/* RECENT MAINTENANCE (Placeholder for next step) */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-medium text-white mb-4">
                Recent Maintenance
              </h2>

              <div className="space-y-3">
                <div className="bg-slate-800 rounded-xl p-4 text-slate-400 text-sm">
                  No maintenance records yet
                </div>
              </div>

              <button className="mt-4 text-teal-400 hover:text-teal-300 text-sm font-medium transition">
                View full history →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
