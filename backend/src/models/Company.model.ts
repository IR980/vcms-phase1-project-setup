import mongoose, {
  Schema,
  Model,
} from "mongoose";

import {
  ICompany,
  CompanyStatus,
} from "../types/company.types";

import {
  COMPANY_CURRENCY,
  COMPANY_LOGO,
  COMPANY_TIMEZONE,
} from "../constants/company.constants";

const companySchema =
  new Schema<ICompany>(
    {
      companyName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      legalName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      ownerName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
      },

      gstNumber: {
        type: String,
        uppercase: true,
        default: "",
      },

      panNumber: {
        type: String,
        uppercase: true,
        default: "",
      },

      address: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      country: {
        type: String,
        default: "India",
      },

      postalCode: {
        type: String,
        required: true,
      },

      logo: {
        type: String,
        default: COMPANY_LOGO,
      },

      website: {
        type: String,
        default: "",
      },

      timezone: {
        type: String,
        default: COMPANY_TIMEZONE,
      },

      currency: {
        type: String,
        default: COMPANY_CURRENCY,
      },

      status: {
        type: String,
        enum: Object.values(
          CompanyStatus
        ),
        default: CompanyStatus.ACTIVE,
      },

      totalVehicles: {
        type: Number,
        default: 0,
      },

      totalDrivers: {
        type: Number,
        default: 0,
      },

      totalDocuments: {
        type: Number,
        default: 0,
      },

      isDeleted: {
        type: Boolean,
        default: false,
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
      versionKey: false,
    }
  );

/**
 * Database Indexes
 */
companySchema.index(
  { companyName: 1 }
);

companySchema.index({
  email: 1,
});

companySchema.index({
  gstNumber: 1,
});

companySchema.index({
  status: 1,
});

companySchema.index({
  isDeleted: 1,
});

companySchema.index({
  createdBy: 1,
});

/**
 * Hide deleted companies automatically
 */
companySchema.pre(
  /^find/,
  function (this: any, next) {
    this.where({
      isDeleted: false,
    });

    next();
  }
);

export const Company: Model<ICompany> =
  mongoose.model<ICompany>(
    "Company",
    companySchema
  );