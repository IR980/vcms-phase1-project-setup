export const CompanyStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;

export interface Company {
  _id: string;

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

  createdAt: string;

  updatedAt: string;
}

export interface CompanyPayload {
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
  timezone?: string;
  currency?: string;
}

export interface CompanyQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: CompanyStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompanyListResponse {
  companies: Company[];
  pagination: Pagination;
}
export type CompanyStatus =
  (typeof CompanyStatus)[keyof typeof CompanyStatus];