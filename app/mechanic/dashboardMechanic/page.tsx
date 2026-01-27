"use client";

import { auth, db } from "@/lib/firebase";
import { Mechanic } from "@/types/Mechanic";
import { Vehicle } from "@/types/Vehicle";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MechanicDashboard() {
  const router = useRouter();
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // ----------------------------
      // LOAD MECHANIC USER DOCUMENT
      // ----------------------------
      const userRef = doc(db, "users", currentUser.uid);

      const unsubscribeUser = onSnapshot(userRef, (snapshot) => {
        if (!snapshot.exists()) {
          console.log("Mechanic profile not found in Firestore.");
          setMechanic(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data() as Mechanic;

        if (data.role !== "mechanic") {
          router.push("/dashboard");
          return;
        }

        setMechanic(data);
        setLoading(false); // mechanic is loaded now
      });

      // ----------------------------
      // LOAD VEHICLES ASSIGNED TO MECHANIC
      // ----------------------------
      const vehiclesQuery = query(
        collection(db, "vehicles"),
        where("mechanicId", "==", currentUser.uid),
      );

      const unsubscribeVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Vehicle, "id">),
        }));

        setVehicles(list);
      });

      // Cleanup listeners when leaving the page
      return () => {
        unsubscribeUser();
        unsubscribeVehicles();
      };
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      setVehicles([]);
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error on signing out: ", error);
      setIsSigningOut(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-300">
        Loading mechanic dashboard...
      </div>
    );

  if (!mechanic)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-300">
        No mechanic data found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-medium text-white tracking-tight">
                Mechanic Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                Welcome, {mechanic.firstName} {mechanic.lastName}
              </p>
              <p className="text-teal-400 mt-2 font-medium">
                {mechanic.garageName}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
              >
                {isSigningOut ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing out...
                  </>
                ) : (
                  "Sign out"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* VEHICLES ASSIGNED */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-white tracking-tight">
              Vehicles In Your Workshop
            </h2>

            <button
              onClick={() => router.push("/mechanic/add-maintenance")}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg font-medium tracking-wide transition"
            >
              + Add Maintenance
            </button>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-slate-400 text-sm">No vehicles assigned.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => router.push(`/mechanic/vehicle/${v.id}`)}
                  className="cursor-pointer bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-white">
                    {v.make} {v.model}
                  </h3>
                  <p className="text-slate-400">{v.year}</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Plate: {v.plateNumber}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
