"use client";

import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import AddVehicleForm from "@/components/AddVehicleForm";
import VehicleList from "@/components/VehicleList";
import LoadingScreen from "@/components/LoadingScreen";
import Spinner from "@/components/Spinner";
import { Vehicle } from "@/types/Vehicle";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [onAddingVehicleModal, setOnAddingVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  const onAddingVehicleModalClose = () => {
    setOnAddingVehicleModal(false);
  };
  const onVehicleAdded = () => {
    setOnAddingVehicleModal(false);
    setSuccessMessage("Vehicle added successfully.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const onEditVehicleOpen = (vehicle: Vehicle) => setEditingVehicle(vehicle);
  const onEditVehicleClose = () => setEditingVehicle(null);
  const onVehicleUpdated = () => {
    setEditingVehicle(null);
    setSuccessMessage("Vehicle updated successfully.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!user || authLoading)
    return <LoadingScreen message="Loading dashboard..." />;

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
      </header>

      {onAddingVehicleModal && (
        <AddVehicleForm
          onClose={onAddingVehicleModalClose}
          onSuccess={onVehicleAdded}
          user={user}
        />
      )}

      {editingVehicle && (
        <AddVehicleForm
          user={user}
          onClose={onEditVehicleClose}
          onSuccess={onVehicleUpdated}
          existingVehicle={editingVehicle}
        />
      )}

      {successMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium">
          {successMessage}
        </div>
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
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 hover:scale-[1.02] active:scale-[0.98] text-white px-6 py-3 rounded-xl shadow-lg font-medium tracking-wide flex items-center gap-2 transition-transform duration-200"
            >
              <span className="text-lg font-bold">+</span>
              Add Vehicle
            </button>
          </div>

          {/* VEHICLE GRID */}
          <VehicleList
            vehicles={vehicles}
            onAddFirstVehicle={onAddingVehicleModalOpen}
            onEditVehicle={onEditVehicleOpen}
          />
        </div>
      </div>
    </div>
  );
}
