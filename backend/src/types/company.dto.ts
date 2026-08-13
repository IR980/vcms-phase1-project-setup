import { CompanyStatus } from "./company.types";

export interface CreateCompanyDto {
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

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {}

export interface CompanyQueryDto {
  page: number;
  limit: number;
  search?: string;
  status?: CompanyStatus;
  sortBy: string;
  sortOrder: "asc" | "desc";
}
