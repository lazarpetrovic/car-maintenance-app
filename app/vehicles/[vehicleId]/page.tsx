"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Vehicle } from "@/types/Vehicle";
import type { Maintenance } from "@/types/Maintenance";
import { brandLogos } from "@/utils/brandLogos";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function VehicleDetailsPage() {
  const params = useParams();
  const vehicleId = Array.isArray(params.vehicleId)
    ? params.vehicleId[0]
    : params.vehicleId;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<Maintenance[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch vehicle data (real-time)
  useEffect(() => {
    if (!vehicleId) return;

    const vehicleRef = doc(db, "vehicles", vehicleId as string);

    const unsubscribe = onSnapshot(
      vehicleRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Vehicle;
          setVehicle({
            ...data,
            id: snap.id,
          });
          setLoading(false);
        } else {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching vehicle:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [vehicleId]);

  // Fetch maintenance records
  useEffect(() => {
    if (!vehicleId) return;

    // Try with orderBy first, fallback to simple query if index not created
    let q = query(
      collection(db, "maintenance"),
      where("vehicleId", "==", vehicleId),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: Maintenance[] = snapshot.docs.map((doc) => {
          const data = doc.data();
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

        setMaintenanceRecords(records);
      },
      (error) => {
        console.error("Error fetching maintenance:", error);

        // If it's a missing index error, try without orderBy
        if (error.code === "failed-precondition") {
          // Fallback query without orderBy
          const fallbackQ = query(
            collection(db, "maintenance"),
            where("vehicleId", "==", vehicleId)
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
      }
    );

    return () => unsubscribe();
  }, [vehicleId]);

  // Calculate statistics
  const totalSpent = maintenanceRecords.reduce(
    (sum, record) => sum + record.totalCost,
    0
  );
  const lastServiceDate =
    maintenanceRecords.length > 0 ? maintenanceRecords[0].date : null;
  const serviceCount = maintenanceRecords.length;
  const recentMaintenance = maintenanceRecords.slice(0, 9); // Show last 9 records (3 rows)

  if (!vehicle || loading) {
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

          {/* VEHICLE SPECIFICATIONS AND SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VEHICLE SPECIFICATIONS */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-md">
              <h2 className="text-xl font-medium text-white mb-6">
                Vehicle Specifications
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Engine</p>
                  <p className="text-slate-200 font-medium">{vehicle.engineType}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Transmission</p>
                  <p className="text-slate-200 font-medium">{vehicle.transmission}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Drivetrain</p>
                  <p className="text-slate-200 font-medium">{vehicle.drivetrain}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Plate Number</p>
                  <p className="text-slate-200 font-medium uppercase font-mono">
                    {vehicle.plateNumber}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Mileage</p>
                  <p className="text-slate-200 font-medium">
                    {vehicle.mileage?.toLocaleString() || 0} km
                  </p>
                </div>
              </div>
            </div>

            {/* VEHICLE SUMMARY */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-md">
              <h2 className="text-xl font-medium text-white mb-6">
                Vehicle Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Last Service</p>
                  <p className="text-slate-200 font-medium">
                    {lastServiceDate
                      ? new Date(lastServiceDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not recorded"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Total Spent</p>
                  <p className="text-teal-400 font-semibold">
                    €{totalSpent.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Services</p>
                  <p className="text-slate-200 font-medium">{serviceCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT MAINTENANCE */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white">
                Recent Maintenance
              </h2>
              {maintenanceRecords.length > 9 && (
                <button
                  onClick={() => {
                    // Could navigate to a full history page or expand view
                  }}
                  className="text-teal-400 hover:text-teal-300 text-sm font-medium transition"
                >
                  View all {serviceCount} records →
                </button>
              )}
            </div>

            {recentMaintenance.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentMaintenance.map((record) => (
                  <div
                    key={record.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-teal-500/50 transition shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 capitalize">
                        {record.type.replace("-", " ")}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Mileage</span>
                        <span className="text-slate-200 text-sm font-medium">
                          {record.mileage.toLocaleString()} km
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">Total Cost</span>
                        <span className="text-teal-400 font-semibold">
                          €{record.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {record.notes && (
                      <p className="text-sm text-slate-300 mt-3 pt-3 border-t border-slate-700 line-clamp-2">
                        {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-8 text-slate-400 text-sm text-center">
                No maintenance records yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
