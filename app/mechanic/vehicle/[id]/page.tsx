"use client";

import { Vehicle } from "@/types/Vehicle";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { brandLogos } from "@/utils/brandLogos";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function VehiclePreview() {
  const { id } = useParams();
  console.log(id);

  const [selectedRepairVehicle, setSelectedRepairVehicle] =
    useState<Vehicle | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;

      const ref = doc(db, "vehicles", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data() as Vehicle;

        setSelectedRepairVehicle({
          ...data,
          id: snap.id,
        });
      }
    };

    fetchVehicle();
  }, [id]);

  if (!selectedRepairVehicle) {
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
          Back to Schedule
        </button>
      </header>

      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* VEHICLE HEADER */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-lg">
            {/* LOGO */}
            <div>
              {brandLogos?.[selectedRepairVehicle.make] && (
                <Image
                  src={brandLogos[selectedRepairVehicle.make]}
                  alt={selectedRepairVehicle.make}
                  width={70}
                  height={70}
                  className="object-contain"
                />
              )}
            </div>

            {/* INFO */}
            <div className="flex-1">
              <h1 className="text-3xl font-medium text-white tracking-tight mb-2">
                {selectedRepairVehicle.make} {selectedRepairVehicle.model}
              </h1>

              {/* ROW WITH 3 SECTIONS */}
              <div className="flex w-full items-center justify-between">
                {/* LEFT */}
                <div className="space-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Production year
                    </p>
                    <p className="text-zinc-100 font-medium font-mono">
                      {selectedRepairVehicle.year}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Plate number
                    </p>
                    <p className="font-mono text-zinc-200 uppercase">
                      {selectedRepairVehicle.plateNumber}
                    </p>
                  </div>
                </div>

                {/* CENTER */}
                <div className="space-y-2 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      VIN
                    </p>
                    <p className="font-mono text-zinc-200 text-sm">
                      {selectedRepairVehicle.vin}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Mileage
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {selectedRepairVehicle.mileage} km
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-2 text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Status
                  </p>
                  <span className="inline-flex rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
                    In Progress
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          {/* DETAILS + LATEST MAINTENANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* CAR DETAILS */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-medium text-zinc-100 mb-4">
                Car Details
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Engine
                  </p>
                  <p className="text-zinc-200 font-medium">
                    {selectedRepairVehicle.engineType}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Transmission
                  </p>
                  <p className="text-zinc-200 font-medium">
                    {selectedRepairVehicle.transmission}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Drivetrain
                  </p>
                  <p className="text-zinc-200 font-medium">
                    {selectedRepairVehicle.drivetrain}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Fuel type
                  </p>
                  <p className="text-zinc-200 font-medium">
                    {selectedRepairVehicle.engineType}
                  </p>
                </div>
              </div>
            </div>

            {/* LATEST MAINTENANCE */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-zinc-100">
                  Latest Maintenance
                </h2>

                <button className="bg-teal-500 hover:bg-teal-400 text-slate-900 text-sm font-medium px-4 py-2 rounded-xl transition">
                  + Add Maintenance
                </button>
              </div>

              {selectedRepairVehicle.latestMaintenance ? (
                <div className="space-y-4">
                  <div className="border-l-2 border-teal-500 pl-4">
                    <p className="text-zinc-200 font-medium capitalize">
                      {selectedRepairVehicle.latestMaintenance.type}
                    </p>

                    <p className="text-slate-400 text-sm">
                      {selectedRepairVehicle.latestMaintenance.date} •{" "}
                      {selectedRepairVehicle.latestMaintenance.mileage} km
                    </p>

                    <p className="text-slate-300 text-sm mt-1">
                      {selectedRepairVehicle.latestMaintenance.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Labor
                      </p>
                      <p className="text-zinc-100 font-medium">
                        €{selectedRepairVehicle.latestMaintenance.laborCost}
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Parts
                      </p>
                      <p className="text-zinc-100 font-medium">
                        €{selectedRepairVehicle.latestMaintenance.partsCost}
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Total
                      </p>
                      <p className="text-zinc-100 font-semibold">
                        €{selectedRepairVehicle.latestMaintenance.totalCost}
                      </p>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Performed by
                      </p>
                      <p className="text-zinc-200 font-medium">
                        {selectedRepairVehicle.latestMaintenance.mechanic}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl p-6 text-slate-400 text-sm">
                  No maintenance records yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
