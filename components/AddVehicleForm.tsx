import { useEffect, useState } from "react";
import { vehicleData } from "@/data/VehicleData";
import type { User } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mechanic } from "@/types/Mechanic";

type AddVehicleFormProps = {
  user: User;
  onClose: () => void;
};

export default function AddVehicleForm({ user, onClose }: AddVehicleFormProps) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [engineType, setEngineType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [mechanicId, setMechanicId] = useState("");

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, "vehicles"), {
        ownerId: user.uid,
        make,
        model,
        year: Number(year),
        vin,
        plateNumber,
        engineType,
        transmission,
        drivetrain,
        mechanicId,
        mileage: 0,
      });

      onClose();
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setError("Failed to add vehicle. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "mechanic"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Mechanic, "id">),
      }));
      console.log(list);
      setMechanics(list);
    });

    return () => unsubscribe();
  }, []);

  const models = make ? vehicleData[make] || [] : [];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl">
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
          onClick={onClose}
        >
          ✕
        </button>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-8"
        >
          <div>
            <h2 className="text-2xl font-medium text-white tracking-tight">
              Add New Vehicle
            </h2>
            <p className="text-sm text-slate-400">
              Enter the details of your vehicle
            </p>
          </div>

          {/* VEHICLE IDENTITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Make</label>
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel("");
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select make...</option>
                {Object.keys(vehicleData).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!make}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select model...</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Plate Number
              </label>
              <input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* TECHNICAL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Engine Type
              </label>
              <select
                value={engineType}
                onChange={(e) => setEngineType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select...</option>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
                <option>Electric</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Transmission
              </label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select...</option>
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Drivetrain
              </label>
              <select
                value={drivetrain}
                onChange={(e) => setDrivetrain(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select...</option>
                <option>FWD</option>
                <option>RWD</option>
                <option>AWD</option>
              </select>
            </div>
          </div>

          {/* VIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">VIN</label>
              <input
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            {/*MECHANIC*/}
            <div>
              <label className="text-sm text-slate-400 mb-1 block">
                Mechanic
              </label>
              <select
                value={mechanicId}
                onChange={(e) => setMechanicId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="">Select mechanic...</option>
                {mechanics.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} - {m.garageName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 px-6 py-2 rounded-xl font-medium flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isSubmitting ? (
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
                  Adding...
                </>
              ) : (
                "Add Vehicle"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
