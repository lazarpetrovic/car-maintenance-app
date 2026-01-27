"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import AddVehicleForm from "@/components/AddVehicleForm";
import VehicleList from "@/components/VehicleList";
import { Vehicle } from "@/types/Vehicle";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [onAddingVehicleModal, setOnAddingVehicleModal] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      setUser(u);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "vehicles"),
      where("ownerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updateVehicles: Vehicle[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Vehicle, "id">),
      }));

      setVehicles(updateVehicles);
    });

    return () => unsubscribe();
  }, [user]);

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

  const onAddingVehicleModalOpen = () => setOnAddingVehicleModal(true);
  const onAddingVehicleModalClose = () => setOnAddingVehicleModal(false);

  if (!user || authLoading)
    return <p className="text-center text-slate-300">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* HEADER */}
      <header className="px-8 py-5 flex justify-between items-center bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-white">
            Maintenance Hub
          </h1>
          <p className="text-sm text-slate-400 pl-2">
            Your vehicle health overview
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user.email}</span>

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
      </header>

      {onAddingVehicleModal && (
        <AddVehicleForm onClose={onAddingVehicleModalClose} user={user} />
      )}

      <div className="h-px bg-slate-800"></div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-xl">
          {/* TITLE + BUTTON */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-slate-100 tracking-tight">
              My Vehicles
            </h2>

            <button
              onClick={onAddingVehicleModalOpen}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg font-medium tracking-wide flex items-center gap-2"
            >
              <span className="text-lg font-bold">+</span>
              Add Vehicle
            </button>
          </div>

          {/* VEHICLE GRID */}
          <VehicleList vehicles={vehicles} />
        </div>
      </div>
    </div>
  );
}
