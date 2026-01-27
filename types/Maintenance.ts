export type MaintenanceType =
  | "oil-change"
  | "brake-service"
  | "inspection"
  | "chain/belt-service"
  | "other";

export interface OilChangeDetails {
  oilType: string;
  oilBrand: string;
  oilQuantity: number;
  isSynthetic: boolean;
  filterBrand?: string;
  washerReplaced: boolean;
}

export interface BrakeDetails {
  axle: "front" | "rear" | "both";
  padsReplaced: boolean;
  discsReplaced: boolean;
}

export interface InspectionDetails {
  result: "ok" | "issues";
  notes?: string;
}

export interface ChainBeltDetails {
  timing: "chain" | "belt";
  brand: string;
  waterPump: boolean;
  timingGuides: boolean;
}

export interface OtherDetails {
  description: string;
}

export interface MaintenanceBase {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  date: string;
  mileage: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  notes: string;
  createdAt: string;
}

export type Maintenance =
  | (MaintenanceBase & {
      type: "oil-change";
      details: OilChangeDetails;
    })
  | (MaintenanceBase & {
      type: "brake-service";
      details: BrakeDetails;
    })
  | (MaintenanceBase & {
      type: "inspection";
      details: InspectionDetails;
    })
  | (MaintenanceBase & {
      type: "chain/belt-service";
      details: ChainBeltDetails;
    })
  | (MaintenanceBase & {
      type: "other";
      details: OtherDetails;
    });
{
  /*
    export interface Maintenance {
        id: string;
        vehicleId: string;
        mileage: number;
        date: Date;
        services: [];
        notes: string;
        totalPrice: number;
    }
    */
}
