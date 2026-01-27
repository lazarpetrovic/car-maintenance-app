"use client";
import { useState } from "react";
import type { Vehicle } from "@/types/Vehicle";
import { brandLogos } from "@/utils/brandLogos";
import Image from "next/image";
import deleteIcon from "../assets/delete.png";
import editIcon from "../assets/edit.png";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface VehicleItemProps {
  vehicle: Vehicle;
}

export default function VehicleItem({ vehicle }: VehicleItemProps) {
  const brand = vehicle.make.trim();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteVehicle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!vehicle.id || isDeleting) return;

    if (!confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, "vehicles", vehicle.id));
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      alert("Failed to delete vehicle. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-4">
        {brandLogos[brand] && (
          <Image
            src={brandLogos[brand]}
            alt={vehicle.make}
            width={48}
            height={48}
            className="object-contain"
          />
        )}

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-slate-100 tracking-tight">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="text-xs bg-teal-950 text-teal-300 px-3 py-1 rounded-full font-medium">
              {vehicle.year}
            </span>
          </div>
          <p className="text-sm text-slate-500">{vehicle.plateNumber}</p>
        </div>
      </div>

      {/* DETAILS */}

      <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
        <p>
          <span className="text-slate-300 font-medium">Engine:</span>{" "}
          {vehicle.engineType}
        </p>
        <p>
          <span className="text-slate-300 font-medium">Transmission:</span>{" "}
          {vehicle.transmission}
        </p>
        <p className="text-xs text-slate-500 break-all">
          <span className="text-slate-400">VIN:</span> {vehicle.vin}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 mt-auto pt-6">
        {/* EDIT */}
        <button
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all group cursor-pointer"
          title="Edit vehicle"
        >
          <Image
            src={editIcon}
            width={18}
            height={18}
            alt="edit vehicle"
            className="group-hover:scale-110 transition-transform"
          />
        </button>

        {/* DELETE */}
        <button
          onClick={handleDeleteVehicle}
          disabled={isDeleting}
          className="p-2 rounded-xl bg-red-950 hover:bg-red-900 transition-all group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete vehicle"
        >
          {isDeleting ? (
            <svg
              className="animate-spin h-[18px] w-[18px] text-red-300"
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
          ) : (
            <Image
              src={deleteIcon}
              width={18}
              height={18}
              alt="delete vehicle"
              className="group-hover:scale-110 transition-transform"
            />
          )}
        </button>
      </div>
    </div>
  );
}
