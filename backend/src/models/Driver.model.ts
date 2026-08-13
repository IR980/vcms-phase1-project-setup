import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * Driver Status
 */
export enum DriverStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ON_LEAVE = "on_leave",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
}

/**
 * Driver Gender
 */
export enum DriverGender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

/**
 * License Type
 */
export enum LicenseType {
  LMV = "lmv",
  HMV = "hmv",
  HGMV = "hgmv",
  TRANSPORT = "transport",
  COMMERCIAL = "commercial",
  OTHER = "other",
}

/**
 * Driver Interface
 */
export interface IDriver extends Document {
  companyId: Types.ObjectId;

  employeeId?: string;

  firstName: string;

  lastName?: string;

  dateOfBirth?: Date;

  gender?: DriverGender;

  profilePhoto?: string;

  mobileNumber: string;

  email?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

  emergencyContactName?: string;

  emergencyContactNumber?: string;

  licenseNumber: string;

  licenseType: LicenseType;

  licenseIssueDate?: Date;

  licenseExpiryDate: Date;

  issuingAuthority?: string;

  joiningDate?: Date;

  department?: string;

  assignedVehicle?: Types.ObjectId | null;

  status: DriverStatus;

  isActive: boolean;

  isDeleted: boolean;

  createdBy: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

/**
 * Driver Schema
 */
const driverSchema = new Schema<IDriver>(
  {
    /**
     * Company
     */
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    /**
     * Employee ID
     */
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /**
     * Personal Information
     */
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    dateOfBirth: {
      type: Date,
    },

    gender: {
      type: String,
      enum: Object.values(DriverGender),
    },

    profilePhoto: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Contact Information
     */
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContactName: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContactNumber: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Driving License
     */
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    licenseType: {
      type: String,
      enum: Object.values(LicenseType),
      required: true,
    },

    licenseIssueDate: {
      type: Date,
    },

    licenseExpiryDate: {
      type: Date,
      required: true,
    },

    issuingAuthority: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Employment
     */
    joiningDate: {
      type: Date,
    },

    department: {
      type: String,
      trim: true,
      default: "",
    },

    /**
     * Vehicle Assignment
     */
    assignedVehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    /**
     * Driver Status
     */
    status: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.ACTIVE,
    },

    /**
     * Active Flag
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /**
     * Soft Delete
     */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * Audit
     */
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
 * Compound Indexes
 */

/**
 * Employee ID should be unique
 * within a company.
 */
driverSchema.index(
  {
    companyId: 1,
    employeeId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      employeeId: {
        $exists: true,
        $ne: "",
      },
      isDeleted: false,
    },
  },
);

/**
 * License Number should be unique
 * within a company.
 */
driverSchema.index(
  {
    companyId: 1,
    licenseNumber: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

/**
 * Mobile Number
 */
driverSchema.index({
  companyId: 1,
  mobileNumber: 1,
});

/**
 * Driver Status
 */
driverSchema.index({
  companyId: 1,
  status: 1,
});

/**
 * License Expiry
 *
 * Useful later for compliance dashboard.
 */
driverSchema.index({
  companyId: 1,
  licenseExpiryDate: 1,
});

/**
 * Assigned Vehicle
 */
driverSchema.index({
  companyId: 1,
  assignedVehicle: 1,
});

/**
 * Company + Active Drivers
 */
driverSchema.index({
  companyId: 1,
  isActive: 1,
  isDeleted: 1,
});

/**
 * Model
 */
export const Driver: Model<IDriver> = mongoose.model<IDriver>(
  "Driver",
  driverSchema,
);
