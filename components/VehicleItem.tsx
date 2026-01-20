"use client";
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

  const handleDeleteVehicle = async () => {
    if (!vehicle.id) return;

    try {
      await deleteDoc(doc(db, "vehicles", vehicle.id));
    } catch (err) {
      console.log(err);
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
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteVehicle();
          }}
          className="p-2 rounded-xl bg-red-950 hover:bg-red-900 transition-all group cursor-pointer"
          title="Delete vehicle"
        >
          <Image
            src={deleteIcon}
            width={18}
            height={18}
            alt="delete vehicle"
            className="group-hover:scale-110 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}
