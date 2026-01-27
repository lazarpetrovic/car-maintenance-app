"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type MaintenanceType =
  | "oil-change"
  | "brake-service"
  | "inspection"
  | "chain/belt-service"
  | "other";

interface AddMaintenanceModalProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    plateNumber: string;
    mileage: number;
  };
  onClose: () => void;
}

const OIL_TYPE_FINAL_REGEX = /^[0-9]{1,2}W-[0-9]{2}$/;
const OIL_TYPE_PARTIAL_REGEX = /^[0-9]{0,2}(W)?(-)?[0-9]{0,2}$/i;

const OIL_BRANDS = [
  "Liqui Moly",
  "Castrol",
  "Mobil 1",
  "Shell",
  "TotalEnergies",
  "Motul",
  "Valvoline",
  "Ravenol",
  "Elf",
  "Fuchs",
  "Petronas",
  "ENEOS",
  "Wolf",
  "Other",
];

export default function AddMaintenanceModal({
  vehicle,
  onClose,
}: AddMaintenanceModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [oilTypeError, setOilTypeError] = useState<string | null>(null);

  const [type, setType] = useState<MaintenanceType>();
  const [date, setDate] = useState(today);
  const [mileage, setMileage] = useState<number>(0);

  const [oilType, setOilType] = useState("");
  const [oilBrand, setOilBrand] = useState("");
  const [oilQuantity, setOilQuantity] = useState<number | 0>(0);
  const [isSynthetic, setIsSynthetic] = useState(false);
  const [oilFilter, setOilFilter] = useState("");
  const [drainWasher, setDrainWasher] = useState(false);

  const [axle, setAxle] = useState<"front" | "rear" | "both">("front");
  const [padsReplaced, setPadsReplaced] = useState(false);
  const [discsReplaced, setDiscsReplaced] = useState(false);

  const [inspectionResult, setInspectionResult] = useState<
    "ok" | "issues" | ""
  >("");
  const [inspectionNotes, setInspectionNotes] = useState("");

  const [timingType, setTimingType] = useState<"chain" | "belt">("belt");
  const [timingBrand, setTimingBrand] = useState("");
  const [waterPump, setWaterPump] = useState(true);
  const [timingGuides, setTimingGuides] = useState(true);

  const [description, setDescription] = useState("");

  const [laborCost, setLaborCost] = useState<number | "">("");
  const [partsCost, setPartsCost] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = (Number(laborCost) || 0) + (Number(partsCost) || 0);

  //if mileage is undefined, set it to 0
  useEffect(() => {
    if(vehicle?.mileage !== undefined && vehicle?.mileage !== null) {
      setMileage(vehicle.mileage);
    }
  }, [vehicle]);

  // Validation function to check if all required fields are filled
  const isFormValid = useMemo(() => {
    // Common required fields
    if (!type || !date || !mileage || mileage <= 0) {
      return false;
    }

    // Type-specific validations
    switch (type) {
      case "oil-change":
        // Oil type must be valid format, oil brand selected, and oil quantity > 0
        // Oil filter is optional but recommended
        return (
          OIL_TYPE_FINAL_REGEX.test(oilType) &&
          oilBrand !== "" &&
          oilQuantity > 0
        );

      case "brake-service":
        // Axle is always set (has default), checkboxes always have values
        return true; // All fields have defaults or are checkboxes

      case "inspection":
        // Inspection result must be selected
        return inspectionResult !== "";

      case "chain/belt-service":
        // Timing brand is required
        return timingBrand.trim() !== "";

      case "other":
        // Description is required for "other" type
        return inspectionNotes.trim() !== "";

      default:
        return false;
    }
  }, [
    type,
    date,
    mileage,
    oilType,
    oilBrand,
    oilQuantity,
    inspectionResult,
    timingBrand,
    inspectionNotes,
    notes
  ]);

  async function handleSave() {
    if (!type) return;
    
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        vehicleId: vehicle.id,
        type,
        date,
        mileage,
        laborCost: Number(laborCost) || 0,
        partsCost: Number(partsCost) || 0,
        totalCost,
        notes,
        createdAt: serverTimestamp(),
        mechanicId: auth.currentUser?.uid,

        details:
          type === "oil-change"
            ? {
                oilType,
                oilBrand,
                oilQuantity,
                isSynthetic,
                oilFilter,
                drainWasher,
              }
            : type === "brake-service"
              ? {
                  axle,
                  padsReplaced,
                  discsReplaced,
                }
              : type === "inspection"
                ? {
                    inspectionResult,
                    inspectionNotes,
                  }
                : type === "chain/belt-service"
                  ? {
                      timingType,
                      timingBrand,
                      waterPump,
                      timingGuides,
                    }
                  : type === "other"
                    ? {
                        description: inspectionNotes,
                      }
                    : null,
        createdBy: auth.currentUser?.uid,
      };

      await addDoc(collection(db, "maintenance"), payload);

      // Update vehicle mileage to the maintenance mileage
      try {
        const vehicleRef = doc(db, "vehicles", vehicle.id);
        await updateDoc(vehicleRef, {
          mileage: mileage,
        });
        console.log("Vehicle mileage updated to:", mileage);
      } catch (updateError) {
        console.error("Error updating vehicle mileage:", updateError);
        // Don't fail the whole operation if mileage update fails
      }

      onClose();
    } catch (err) {
      console.error("Error saving maintenance:", err);
      setError("Failed to save maintenance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700 flex justify-between">
          <div className="mx-auto">
            <h2 className="text-2xl text-center font-medium text-zinc-100">
              Add Maintenance
            </h2>
            <p className="text-sm text-slate-400">
              {vehicle.make} {vehicle.model} •{" "}
              <span className="uppercase font-mono">{vehicle.plateNumber}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-4">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as MaintenanceType)}
              className="bg-slate-800 text-white p-3 rounded-xl"
            >
              <option value="">Type</option>
              <option value="oil-change">Oil Change</option>
              <option value="brake-service">Brake Service</option>
              <option value="inspection">Inspection</option>
              <option value="chain/belt-service">Timing Service</option>
              <option value="other">Other</option>
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-800 p-3 rounded-xl text-white"
            />

            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              placeholder="Mileage"
              className="bg-slate-800 text-white p-3 rounded-xl"
            />
          </div>

          {type === "oil-change" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. 5W-30"
                  value={oilType}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();

                    if (!OIL_TYPE_PARTIAL_REGEX.test(value)) return;

                    setOilType(value);

                    if (value.length === 0) {
                      setOilTypeError(null);
                    } else if (!OIL_TYPE_FINAL_REGEX.test(value)) {
                      setOilTypeError("Use format like 5W-30");
                    } else {
                      setOilTypeError(null);
                    }
                  }}
                  className={`bg-slate-800 p-3 rounded-xl text-white w-full border ${
                    oilTypeError
                      ? "border-rose-500"
                      : oilType
                        ? "border-teal-500"
                        : "border-slate-700"
                  }`}
                />

                {oilTypeError && (
                  <p className="text-rose-400 text-sm">{oilTypeError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Oil brand
                </label>

                <select
                  value={oilBrand}
                  onChange={(e) => setOilBrand(e.target.value)}
                  className="bg-slate-800 p-3 rounded-xl text-white w-full"
                >
                  <option value="">Select oil brand</option>

                  {OIL_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="number"
                placeholder="Oil quantity (L)"
                value={oilQuantity}
                onChange={(e) =>
                  setOilQuantity(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                className="bg-slate-800 p-3 rounded-xl text-white w-full"
              />

              <input
                placeholder="Oil filter"
                value={oilFilter}
                onChange={(e) => setOilFilter(e.target.value)}
                className="bg-slate-800 p-3 rounded-xl text-white w-full"
              />

              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={isSynthetic}
                  onChange={(e) => setIsSynthetic(e.target.checked)}
                />
                Is Oil Synthetic?
              </label>

              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={drainWasher}
                  onChange={(e) => setDrainWasher(e.target.checked)}
                />
                Drain washer replaced
              </label>
            </div>
          )}

          {type === "brake-service" && (
            <div className="space-y-4">
              <select
                value={axle}
                onChange={(e) =>
                  setAxle(e.target.value as "front" | "rear" | "both")
                }
                className="bg-slate-800 p-3 rounded-xl text-white w-full"
              >
                <option value="front">Front axle</option>
                <option value="rear">Rear axle</option>
                <option value="both">Both axles</option>
              </select>

              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={padsReplaced}
                  onChange={(e) => setPadsReplaced(e.target.checked)}
                />
                Pads replaced
              </label>

              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={discsReplaced}
                  onChange={(e) => setDiscsReplaced(e.target.checked)}
                />
                Discs replaced
              </label>
            </div>
          )}

          {type === "inspection" && (
            <div className="space-y-4">
              <select
                value={inspectionResult}
                onChange={(e) =>
                  setInspectionResult(e.target.value as "ok" | "issues")
                }
                className="bg-slate-800 p-3 rounded-xl text-white w-full"
              >
                <option value="">Result</option>
                <option value="ok">OK</option>
                <option value="issues">Issues found</option>
              </select>

              <textarea
                placeholder="Inspection notes"
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                className="bg-slate-800 p-3 rounded-xl text-white w-full"
              />
            </div>
          )}

          {type === "chain/belt-service" && (
            <div className="space-y-4">
              <select
                value={timingType}
                onChange={(e) =>
                  setTimingType(e.target.value as "chain" | "belt")
                }
                className="bg-slate-800 p-3 rounded-xl text-white w-full"
              >
                <option value="chain">Chain Timing</option>
                <option value="belt">Belt Timing</option>
              </select>

              <input
                placeholder="Timing Brand"
                value={timingBrand}
                onChange={(e) => setTimingBrand(e.target.value)}
                className="bg-slate-800 p-3 rounded-xl text-white w-full"
              />

              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={waterPump}
                  onChange={(e) => setWaterPump(e.target.checked)}
                />
                Water pump
              </label>

              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={timingGuides}
                  onChange={(e) => setTimingGuides(e.target.checked)}
                />
                Timing Guides
              </label>
            </div>
          )}

          {type === "other" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-slate-500">
                  Description *
                </label>
                <textarea
                  placeholder="Describe the maintenance work performed..."
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  className="bg-slate-800 p-3 rounded-xl text-white w-full min-h-[100px]"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Labor €"
              value={laborCost}
              onChange={(e) =>
                setLaborCost(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="bg-slate-800 p-3 rounded-xl text-white"
            />
            <input
              type="number"
              placeholder="Parts €"
              value={partsCost}
              onChange={(e) =>
                setPartsCost(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="bg-slate-800 p-3 rounded-xl text-white"
            />
            <div className="bg-slate-800 p-3 rounded-xl text-zinc-100 font-medium flex items-center">
              €{totalCost.toFixed(2)}
            </div>
          </div>

          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-800 p-3 rounded-xl text-white w-full"
          />

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 px-6 py-2 rounded-xl font-medium flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isSaving ? (
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
                Saving...
              </>
            ) : (
              "Save Maintenance"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
