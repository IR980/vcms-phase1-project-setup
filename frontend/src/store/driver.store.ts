import { create } from "zustand";

import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../api/driver.api";

import type {
  Driver,
  CreateDriverDto,
  UpdateDriverDto,
  DriverQueryParams,
  DriverPagination,
} from "../types/driver.types";

import { DEFAULT_DRIVER_QUERY } from "../constants/driver.constants";

interface DriverState {
  /**
   * Driver List
   */
  drivers: Driver[];

  /**
   * Selected Driver
   */
  selectedDriver: Driver | null;

  /**
   * Pagination
   */
  pagination: DriverPagination;

  /**
   * Current Query
   */
  query: DriverQueryParams;

  /**
   * Loading State
   */
  loading: boolean;

  /**
   * Error State
   */
  error: string | null;

  /**
   * Fetch Drivers
   */
  fetchDrivers: (params?: DriverQueryParams) => Promise<void>;

  /**
   * Fetch Single Driver
   */
  fetchDriver: (id: string) => Promise<Driver | null>;

  /**
   * Create Driver
   */
  addDriver: (payload: CreateDriverDto) => Promise<Driver>;

  /**
   * Update Driver
   */
  editDriver: (id: string, payload: UpdateDriverDto) => Promise<Driver>;

  /**
   * Delete Driver
   */
  removeDriver: (id: string) => Promise<void>;

  /**
   * Set Query
   */
  setQuery: (query: Partial<DriverQueryParams>) => void;

  /**
   * Reset Query
   */
  resetQuery: () => void;

  /**
   * Clear Selected Driver
   */
  clearSelectedDriver: () => void;

  /**
   * Clear Error
   */
  clearError: () => void;
}

const defaultPagination: DriverPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useDriverStore = create<DriverState>((set, get) => ({
  /**
   * Initial State
   */
  drivers: [],

  selectedDriver: null,

  pagination: defaultPagination,

  query: {
    ...DEFAULT_DRIVER_QUERY,
  },

  loading: false,

  error: null,

  /**
   * Fetch Drivers
   */
  fetchDrivers: async (params) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const currentQuery = {
        ...get().query,
        ...params,
      };

      const response = await getDrivers(currentQuery);

      set({
        drivers: response.data.drivers,

        pagination: response.data.pagination,

        query: currentQuery,

        loading: false,

        error: null,
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch drivers";

      set({
        loading: false,
        error: message,
      });

      throw error;
    }
  },

  /**
   * Fetch Single Driver
   */
  fetchDriver: async (id) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await getDriverById(id);

      const driver = response.data;

      set({
        selectedDriver: driver,
        loading: false,
        error: null,
      });

      return driver;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch driver";

      set({
        selectedDriver: null,
        loading: false,
        error: message,
      });

      return null;
    }
  },

  /**
   * Create Driver
   */
  addDriver: async (payload) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await createDriver(payload);

      const driver = response.data;

      /**
       * Add newly created driver
       * to the current list.
       */
      set((state) => ({
        drivers: [driver, ...state.drivers],

        loading: false,

        error: null,
      }));

      return driver;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create driver";

      set({
        loading: false,
        error: message,
      });

      throw error;
    }
  },

  /**
   * Update Driver
   */
  editDriver: async (id, payload) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await updateDriver(id, payload);

      const driver = response.data;

      /**
       * Update Driver in List
       */
      set((state) => ({
        drivers: state.drivers.map((item) => (item._id === id ? driver : item)),

        selectedDriver:
          state.selectedDriver?._id === id ? driver : state.selectedDriver,

        loading: false,

        error: null,
      }));

      return driver;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update driver";

      set({
        loading: false,
        error: message,
      });

      throw error;
    }
  },

  /**
   * Delete Driver
   */
  removeDriver: async (id) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await deleteDriver(id);

      /**
       * Remove Driver from List
       */
      set((state) => ({
        drivers: state.drivers.filter((driver) => driver._id !== id),

        selectedDriver:
          state.selectedDriver?._id === id ? null : state.selectedDriver,

        loading: false,

        error: null,
      }));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete driver";

      set({
        loading: false,
        error: message,
      });

      throw error;
    }
  },

  /**
   * Set Query
   */
  setQuery: (query) => {
    set((state) => ({
      query: {
        ...state.query,
        ...query,
      },
    }));
  },

  /**
   * Reset Query
   */
  resetQuery: () => {
    set({
      query: {
        ...DEFAULT_DRIVER_QUERY,
      },

      pagination: defaultPagination,
    });
  },

  /**
   * Clear Selected Driver
   */
  clearSelectedDriver: () => {
    set({
      selectedDriver: null,
    });
  },

  /**
   * Clear Error
   */
  clearError: () => {
    set({
      error: null,
    });
  },
}));
