// import api from "./api";

// import type {
//   Company,
//   CompanyPayload,
//   CompanyListResponse,
//   CompanyQuery,
// } from "../types/company.types";

// /**
//  * Generic API Response
//  */
// interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }

// /**
//  * Build query string
//  */
// const buildQuery = (query?: CompanyQuery) => {
//   const params = new URLSearchParams();

//   if (!query) return "";

//   Object.entries(query).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       params.append(key, String(value));
//     }
//   });

//   return params.toString() ? `?${params.toString()}` : "";
// };

// /**
//  * Get Companies
//  */
// export const getCompanies = async (
//   query?: CompanyQuery,
// ): Promise<CompanyListResponse> => {
//   const response = await api.get<ApiResponse<CompanyListResponse>>(
//     `/companies${buildQuery(query)}`,
//   );

//   return response.data.data;
// };

// /**
//  * Get Company
//  */
// export const getCompanyById = async (id: string): Promise<Company> => {
//   const response = await api.get<ApiResponse<Company>>(`/companies/${id}`);

//   return response.data.data;
// };

// /**
//  * Create Company
//  */
// export const createCompany = async (
//   payload: CompanyPayload,
// ): Promise<Company> => {
//   const response = await api.post<ApiResponse<Company>>("/companies", payload);

//   return response.data.data;
// };

// /**
//  * Update Company
//  */
// export const updateCompany = async (
//   id: string,
//   payload: Partial<CompanyPayload>,
// ): Promise<Company> => {
//   const response = await api.put<ApiResponse<Company>>(
//     `/companies/${id}`,
//     payload,
//   );

//   return response.data.data;
// };

// /**
//  * Delete Company
//  */
// export const deleteCompany = async (id: string): Promise<void> => {
//   await api.delete(`/companies/${id}`);
// };

import api from "./api";

import type {
  Company,
  CompanyPayload,
  CompanyListResponse,
  CompanyQuery,
} from "../types/company.types";

/**
 * ============================================================
 * Generic API Response
 * ============================================================
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * ============================================================
 * Build Query String
 * ============================================================
 */
const buildQuery = (query?: CompanyQuery): string => {
  const params = new URLSearchParams();

  if (!query) {
    return "";
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  return params.toString() ? `?${params.toString()}` : "";
};

/**
 * ============================================================
 * Get Companies
 * ============================================================
 */
export const getCompanies = async (
  query?: CompanyQuery,
): Promise<CompanyListResponse> => {
  const response = await api.get<ApiResponse<CompanyListResponse>>(
    `/companies${buildQuery(query)}`,
  );

  return response.data.data;
};

/**
 * ============================================================
 * Get Company By ID
 * ============================================================
 */
export const getCompanyById = async (id: string): Promise<Company> => {
  const response = await api.get<ApiResponse<Company>>(`/companies/${id}`);

  return response.data.data;
};

/**
 * ============================================================
 * Create Company
 * ============================================================
 */
export const createCompany = async (
  payload: CompanyPayload,
): Promise<Company> => {
  const response = await api.post<ApiResponse<Company>>("/companies", payload);

  return response.data.data;
};

/**
 * ============================================================
 * Update Company
 * ============================================================
 */
export const updateCompany = async (
  id: string,
  payload: Partial<CompanyPayload>,
): Promise<Company> => {
  const response = await api.put<ApiResponse<Company>>(
    `/companies/${id}`,
    payload,
  );

  return response.data.data;
};

/**
 * ============================================================
 * Delete Company
 * ============================================================
 */
export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/companies/${id}`);
};
