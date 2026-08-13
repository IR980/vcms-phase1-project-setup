// import api from "./api";

// import type{CreateVehicleDto,UpdateVehicleDto,VehicleQueryDto,VehicleResponse,VehicleListResponse,} from "../types/vehicle.types";

// /**
//  * Create Vehicle
//  */
// export const createVehicle = async (
//   payload: CreateVehicleDto,
// ): Promise<VehicleResponse> => {
//   const { data } = await api.post("/vehicles", payload);

//   return data;
// };

// /**
//  * Get Vehicles
//  */
// export const getVehicles = async (
//   params: VehicleQueryDto,
// ): Promise<VehicleListResponse> => {
//   const { data } = await api.get("/vehicles", {
//     params,
//   });

//   return data;
// };

// /**
//  * Get Vehicle By ID
//  */
// export const getVehicleById = async (id: string): Promise<VehicleResponse> => {
//   const { data } = await api.get(`/vehicles/${id}`);

//   return data;
// };

// /**
//  * Update Vehicle
//  */
// export const updateVehicle = async (
//   id: string,
//   payload: UpdateVehicleDto,
// ): Promise<VehicleResponse> => {
//   const { data } = await api.put(`/vehicles/${id}`, payload);

//   return data;
// };

// /**
//  * Delete Vehicle
//  */
// export const deleteVehicle = async (id: string): Promise<VehicleResponse> => {
//   const { data } = await api.delete(`/vehicles/${id}`);

//   return data;
// };

import api from "./api";

import type {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
  VehicleResponse,
  VehicleListResponse,
} from "../types/vehicle.types";

/**
 * ============================================================
 * Create Vehicle
 * ============================================================
 */
export const createVehicle = async (
  payload: CreateVehicleDto,
): Promise<VehicleResponse> => {
  const { data } = await api.post<VehicleResponse>("/vehicles", payload);

  return data;
};

/**
 * ============================================================
 * Get Vehicles
 * ============================================================
 */
export const getVehicles = async (
  params: VehicleQueryDto = {},
): Promise<VehicleListResponse> => {
  const { data } = await api.get<VehicleListResponse>("/vehicles", {
    params,
  });

  return data;
};

/**
 * ============================================================
 * Get Vehicle By ID
 * ============================================================
 */
export const getVehicleById = async (id: string): Promise<VehicleResponse> => {
  const { data } = await api.get<VehicleResponse>(`/vehicles/${id}`);

  return data;
};

/**
 * ============================================================
 * Update Vehicle
 * ============================================================
 */
export const updateVehicle = async (
  id: string,
  payload: UpdateVehicleDto,
): Promise<VehicleResponse> => {
  const { data } = await api.put<VehicleResponse>(`/vehicles/${id}`, payload);

  return data;
};

/**
 * ============================================================
 * Delete Vehicle
 * ============================================================
 */
export const deleteVehicle = async (id: string): Promise<VehicleResponse> => {
  const { data } = await api.delete<VehicleResponse>(`/vehicles/${id}`);

  return data;
};
