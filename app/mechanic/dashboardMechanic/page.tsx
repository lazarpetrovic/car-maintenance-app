"use client";

import { auth, db } from "@/lib/firebase";
import { Mechanic } from "@/types/Mechanic";
import { Vehicle } from "@/types/Vehicle";
import { onAuthStateChanged, signOut } from "firebase/auth";
import LoadingScreen from "@/components/LoadingScreen";
import Spinner from "@/components/Spinner";
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
    return <LoadingScreen message="Loading mechanic dashboard..." />;

  if (!mechanic)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-slate-300">No mechanic data found.</p>
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
                className="bg-red-600 hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
              >
                {isSigningOut ? (
                  <>
                    <Spinner size="sm" className="text-white" />
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
          </div>

          {vehicles.length === 0 ? (
            <p className="text-slate-400 text-sm">No vehicles assigned.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => router.push(`/mechanic/vehicle/${v.id}`)}
                  className="cursor-pointer bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg hover:-translate-y-1 hover:shadow-2xl hover:border-teal-500/30 transition-all duration-200"
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
