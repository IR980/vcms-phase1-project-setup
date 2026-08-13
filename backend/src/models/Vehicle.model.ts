import mongoose, { Schema, Document, Model, Types } from "mongoose";

export enum VehicleStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  SOLD = "sold",
}

export enum VehicleType {
  TRUCK = "truck",
  BUS = "bus",
  CAR = "car",
  VAN = "van",
  PICKUP = "pickup",
  TRAILER = "trailer",
  OTHER = "other",
}

export enum FuelType {
  DIESEL = "diesel",
  PETROL = "petrol",
  CNG = "cng",
  LNG = "lng",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
}

export interface IVehicle extends Document {
  companyId: Types.ObjectId;

  vehicleNumber: string;

  vehicleName?: string;

  vehicleType: VehicleType;

  manufacturer: string;

  vehicleModel: string;

  manufacturingYear: number;

  color?: string;

  fuelType: FuelType;

  transmission?: string;

  registrationNumber: string;

  registrationDate?: Date;

  chassisNumber: string;

  engineNumber: string;

  currentOdometer: number;

  assignedDriver?: Types.ObjectId | null;

  status: VehicleStatus;

  isActive: boolean;
  isDeleted?: boolean;

  createdBy: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    vehicleName: {
      type: String,
      trim: true,
      default: "",
    },

    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
    },

    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    manufacturingYear: {
      type: Number,
      required: true,
      min: 1980,
      max: new Date().getFullYear() + 1,
    },

    color: {
      type: String,
      default: "",
    },

    fuelType: {
      type: String,
      enum: Object.values(FuelType),
      required: true,
    },

    transmission: {
      type: String,
      default: "",
    },

    registrationNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    registrationDate: {
      type: Date,
    },

    chassisNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    engineNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    currentOdometer: {
      type: Number,
      default: 0,
      min: 0,
    },

    assignedDriver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.ACTIVE,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Compound indexes
 */
vehicleSchema.index(
  {
    companyId: 1,
    vehicleNumber: 1,
    isDeleted: 1,
  },
  {
    unique: true,
  },
);

vehicleSchema.index(
  {
    companyId: 1,
    registrationNumber: 1,
  },
  {
    unique: true,
  },
);

vehicleSchema.index({
  companyId: 1,
  status: 1,
});

vehicleSchema.index({
  companyId: 1,
  manufacturer: 1,
});

vehicleSchema.index({
  companyId: 1,
  fuelType: 1,
});

export const Vehicle: Model<IVehicle> = mongoose.model<IVehicle>(
  "Vehicle",
  vehicleSchema,
);
