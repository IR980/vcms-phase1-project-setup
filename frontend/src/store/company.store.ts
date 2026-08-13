import { create } from "zustand";

import type{
  Company,
  CompanyPayload,
  CompanyQuery,
  CompanyListResponse,
} from "../types/company.types";

import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../api/company.api";

interface CompanyStore {
  companies: Company[];

  selectedCompany: Company | null;

  pagination: CompanyListResponse["pagination"] | null;

  loading: boolean;

  error: string | null;

  query: CompanyQuery;

  setQuery: (query: Partial<CompanyQuery>) => void;

  fetchCompanies: () => Promise<void>;

  fetchCompany: (id: string) => Promise<void>;

  addCompany: (payload: CompanyPayload) => Promise<Company>;

  editCompany: (
    id: string,
    payload: Partial<CompanyPayload>,
  ) => Promise<Company>;

  removeCompany: (id: string) => Promise<void>;

  clearSelectedCompany: () => void;

  clearError: () => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: [],

  selectedCompany: null,

  pagination: null,

  loading: false,

  error: null,

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

  fetchCompanies: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const result = await getCompanies(get().query);

      set({
        companies: result.companies,
        pagination: result.pagination,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message ?? "Failed to fetch companies.",
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  fetchCompany: async (id) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const company = await getCompanyById(id);

      set({
        selectedCompany: company,
      });
    } catch (error: any) {
      set({
        error: error?.response?.data?.message ?? "Failed to fetch company.",
      });
    } finally {
      set({
        loading: false,
      });
    }
  },

  addCompany: async (payload) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const company = await createCompany(payload);

      set((state) => ({
        companies: [company, ...state.companies],
      }));

      return company;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Failed to create company.";

      set({
        error: message,
      });

      throw error;
    } finally {
      set({
        loading: false,
      });
    }
  },

  editCompany: async (id, payload) => {
    try {
      set({
        loading: true,
        error: null,
      });

      const company = await updateCompany(id, payload);

      set((state) => ({
        companies: state.companies.map((item) =>
          item._id === id ? company : item,
        ),

        selectedCompany:
          state.selectedCompany?._id === id ? company : state.selectedCompany,
      }));

      return company;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Failed to update company.";

      set({
        error: message,
      });

      throw error;
    } finally {
      set({
        loading: false,
      });
    }
  },

  removeCompany: async (id) => {
    try {
      set({
        loading: true,
        error: null,
      });

      await deleteCompany(id);

      set((state) => ({
        companies: state.companies.filter((company) => company._id !== id),

        selectedCompany:
          state.selectedCompany?._id === id ? null : state.selectedCompany,
      }));
    } catch (error: any) {
      set({
        error: error?.response?.data?.message ?? "Failed to delete company.",
      });

      throw error;
    } finally {
      set({
        loading: false,
      });
    }
  },

  clearSelectedCompany: () =>
    set({
      selectedCompany: null,
    }),

  clearError: () =>
    set({
      error: null,
    }),
}));
