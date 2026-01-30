"use client";
import { useState } from "react";
import type { Vehicle } from "@/types/Vehicle";
import { brandLogos } from "@/utils/brandLogos";
import Image from "next/image";
import deleteIcon from "../assets/delete.png";
import editIcon from "../assets/edit.png";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Spinner from "./Spinner";

interface VehicleItemProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
}

export default function VehicleItem({ vehicle, onEdit }: VehicleItemProps) {
  const brand = vehicle.make.trim();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteVehicle = async (e: React.MouseEvent) => {
    e.preventDefault();
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

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
          <p className="text-sm text-slate-500 uppercase">{vehicle.plateNumber}</p>
        </div>
      </div>

      {/* DETAILS */}

      <div className="text-md text-slate-400 space-y-2 leading-relaxed">
        <p>
          <span className="text-slate-300 font-medium">Engine:</span>{" "}
          {vehicle.engineType}
        </p>
        <p>
          <span className="text-slate-300 font-medium">Transmission:</span>{" "}
          {vehicle.transmission}
        </p>
        <p className="text-md text-slate-500 break-all">
          <span className="text-slate-400">VIN:</span> <span className="uppercase">{vehicle.vin}</span>
        </p>
      </div>

      {/* ACTIONS - stop propagation so card click doesn't navigate when clicking buttons */}
      <div className="flex justify-end gap-3 mt-auto pt-6" onClick={stopPropagation}>
        {/* EDIT */}
        <button
          type="button"
          onClick={() => onEdit?.(vehicle)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-transform duration-200 group cursor-pointer"
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
          type="button"
          onClick={handleDeleteVehicle}
          disabled={isDeleting}
          className="p-2 rounded-xl bg-red-950 hover:bg-red-900 hover:scale-105 active:scale-95 transition-transform duration-200 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete vehicle"
        >
          {isDeleting ? (
            <Spinner size="sm" className="text-red-300" />
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
