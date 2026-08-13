import { create } from "zustand";

import * as vehicleApi from "../api/vehicle.api";

import type{
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
  Pagination,
} from "../types/vehicle.types";

interface VehicleStore {
  // State
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;

  loading: boolean;
  error: string | null;

  pagination: Pagination;

  query: VehicleQueryDto;

  // Actions
  setQuery: (query: Partial<VehicleQueryDto>) => void;

  clearSelectedVehicle: () => void;

  fetchVehicles: () => Promise<void>;

  fetchVehicle: (id: string) => Promise<void>;

  addVehicle: (payload: CreateVehicleDto) => Promise<Vehicle>;

  editVehicle: (id: string, payload: UpdateVehicleDto) => Promise<Vehicle>;

  removeVehicle: (id: string) => Promise<void>;
}

const defaultPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],

  selectedVehicle: null,

  loading: false,

  error: null,

  pagination: defaultPagination,

  query: {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  setQuery: (query) =>
    set((state) => ({
      query: {
        ...state.query,
        ...query,
      },
    })),

  clearSelectedVehicle: () =>
    set({
      selectedVehicle: null,
    }),

  /**
   * Fetch Vehicles
   */
  fetchVehicles: async () => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await vehicleApi.getVehicles(get().query);

      set({
        vehicles: response.data.vehicles,

        pagination: response.data.pagination,

        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,

        error: error?.response?.data?.message ?? "Unable to fetch vehicles",
      });
    }
  },

  /**
   * Fetch Vehicle
   */
  fetchVehicle: async (id: string) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await vehicleApi.getVehicleById(id);

      set({
        selectedVehicle: response.data,

        loading: false,
      });
    } catch (error: any) {
      set({
        loading: false,

        error: error?.response?.data?.message ?? "Unable to fetch vehicle",
      });
    }
  },

  /**
   * Create Vehicle
   */
  addVehicle: async (payload) => {
    const response = await vehicleApi.createVehicle(payload);

    await get().fetchVehicles();

    return response.data;
  },

  /**
   * Update Vehicle
   */
  editVehicle: async (id, payload) => {
    const response = await vehicleApi.updateVehicle(id, payload);

    set({
      selectedVehicle: response.data,
    });

    await get().fetchVehicles();

    return response.data;
  },

  /**
   * Delete Vehicle
   */
  removeVehicle: async (id) => {
    await vehicleApi.deleteVehicle(id);

    set((state) => ({
      vehicles: state.vehicles.filter((vehicle) => vehicle._id !== id),
    }));

    await get().fetchVehicles();
  },
}));
