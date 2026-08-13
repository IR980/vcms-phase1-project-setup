import api from "./api";

import type {
  CreateDriverDto,
  UpdateDriverDto,
  DriverQueryParams,
  DriverListResponse,
  DriverResponse,
} from "../types/driver.types";

/**
 * Create Driver
 */
export const createDriver = async (
  payload: CreateDriverDto,
): Promise<DriverResponse> => {
  const response = await api.post<DriverResponse>("/drivers", payload);

  return response.data;
};

/**
 * Get Drivers
 */
export const getDrivers = async (
  params?: DriverQueryParams,
): Promise<DriverListResponse> => {
  const response = await api.get<DriverListResponse>("/drivers", {
    params,
  });

  return response.data;
};

/**
 * Get Driver By ID
 */
export const getDriverById = async (id: string): Promise<DriverResponse> => {
  const response = await api.get<DriverResponse>(`/drivers/${id}`);

  return response.data;
};

/**
 * Update Driver
 */
export const updateDriver = async (
  id: string,
  payload: UpdateDriverDto,
): Promise<DriverResponse> => {
  const response = await api.patch<DriverResponse>(`/drivers/${id}`, payload);

  return response.data;
};

/**
 * Delete Driver
 */
export const deleteDriver = async (id: string): Promise<DriverResponse> => {
  const response = await api.delete<DriverResponse>(`/drivers/${id}`);

  return response.data;
};
