"use client";

import { Vehicle } from "@/types/Vehicle";
import { Maintenance } from "@/types/Maintenance";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { brandLogos } from "@/utils/brandLogos";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddMaintenanceModal from "@/components/modals/AddMaintenanceModal";

export default function VehiclePreview() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);

  const [selectedRepairVehicle, setSelectedRepairVehicle] =
    useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Fetch vehicle data (real-time)
  useEffect(() => {
    if (!id) return;

    const vehicleRef = doc(db, "vehicles", id as string);

    const unsubscribe = onSnapshot(
      vehicleRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Vehicle;

          setSelectedRepairVehicle({
            ...data,
            id: snap.id,
          });
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching vehicle:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  // Fetch maintenance records
  useEffect(() => {
    if (!id) return;

    console.log("Fetching maintenance for vehicle ID:", id);

    // Try with orderBy first, fallback to simple query if index not created
    let q = query(
      collection(db, "maintenance"),
      where("vehicleId", "==", id),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Snapshot received, docs count:", snapshot.docs.length);
        
        const records: Maintenance[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Maintenance doc data:", { id: doc.id, ...data });
          return {
            id: doc.id,
            ...(data as Omit<Maintenance, "id">),
          } as Maintenance;
        });

        // Sort by date if orderBy didn't work
        records.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA; // Descending
        });

        console.log("Processed maintenance records:", records);
        setMaintenanceRecords(records);
      },
      (error) => {
        console.error("Error fetching maintenance:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // If it's a missing index error, try without orderBy
        if (error.code === "failed-precondition") {
          console.warn(
            "Index not found. Trying query without orderBy..."
          );
          
          // Fallback query without orderBy
          const fallbackQ = query(
            collection(db, "maintenance"),
            where("vehicleId", "==", id)
          );
          
          onSnapshot(
            fallbackQ,
            (snapshot) => {
              const records: Maintenance[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...(data as Omit<Maintenance, "id">),
                } as Maintenance;
              });
              
              // Sort manually
              records.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
              });
              
              setMaintenanceRecords(records);
            },
            (fallbackError) => {
              console.error("Fallback query also failed:", fallbackError);
            }
          );
        }
      },
    );

    return () => unsubscribe();
  }, [id]);

  // Calculate statistics
  const totalSpent = maintenanceRecords.reduce(
    (sum, record) => sum + record.totalCost,
    0,
  );
  const lastServiceDate =
    maintenanceRecords.length > 0 ? maintenanceRecords[0].date : null;
  const serviceCount = maintenanceRecords.length;

  if (!selectedRepairVehicle || loading) {
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
                      {selectedRepairVehicle.mileage?.toLocaleString() || 0} km
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

                <div className="pt-4 border-t border-slate-700">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                    Maintenance Stats
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-400 text-sm">Last Service: </span>
                      <span className="text-zinc-200 font-medium text-sm">
                        {lastServiceDate
                          ? new Date(lastServiceDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Never"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Total Spent: </span>
                      <span className="text-teal-400 font-semibold text-sm">
                        €{totalSpent.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Services: </span>
                      <span className="text-zinc-200 font-medium text-sm">
                        {serviceCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAINTENANCE HISTORY */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">
                    Maintenance History
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {serviceCount} service{serviceCount !== 1 ? "s" : ""} • €
                    {totalSpent.toFixed(2)} total
                  </p>
                </div>

                <button
                  onClick={() => setOpen(true)}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-900 text-sm font-medium px-4 py-2 rounded-xl transition"
                >
                  + Add Maintenance
                </button>
              </div>

              {open && (
                <AddMaintenanceModal
                  vehicle={selectedRepairVehicle}
                  onClose={() => setOpen(false)}
                />
              )}

              {maintenanceRecords.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {maintenanceRecords.map((record) => (
                    <div
                      key={record.id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-teal-500/50 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 capitalize">
                              {record.type.replace("-", " ")}
                            </span>
                            <span className="text-sm text-slate-400">
                              {new Date(record.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-sm text-slate-400">
                              • {record.mileage.toLocaleString()} km
                            </span>
                          </div>

                          {record.notes && (
                            <p className="text-sm text-slate-300 mt-2">
                              {record.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div>
                              <span className="text-slate-500">Labor: </span>
                              <span className="text-zinc-200 font-medium">
                                €{record.laborCost.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">Parts: </span>
                              <span className="text-zinc-200 font-medium">
                                €{record.partsCost.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500">Total: </span>
                              <span className="text-teal-400 font-semibold">
                                €{record.totalCost.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800 rounded-xl p-6 text-slate-400 text-sm text-center">
                  No maintenance records yet. Add your first maintenance record
                  to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
