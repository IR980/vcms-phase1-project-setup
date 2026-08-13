import { Document, Types } from "mongoose";

export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export interface ICompany extends Document {
  companyName: string;
  legalName: string;

  ownerName: string;

  email: string;

  phone: string;

  gstNumber?: string;

  panNumber?: string;

  address: string;

  city: string;

  state: string;

  country: string;

  postalCode: string;

  logo?: string;

  website?: string;

  timezone: string;

  currency: string;

  status: CompanyStatus;

  totalVehicles: number;

  totalDrivers: number;

  totalDocuments: number;

  isDeleted: boolean;

  createdBy: Types.ObjectId;

  updatedBy?: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
