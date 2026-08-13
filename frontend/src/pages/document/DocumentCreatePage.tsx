import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { FileText, RefreshCw } from "lucide-react";

import api from "../../api/api";

import DocumentForm from "../../components/document/DocumentForm/DocumentForm";

import { useDocumentStore } from "../../store/document.store";

import type {
  CreateDocumentFormData,
  UpdateDocumentFormData,
} from "../../types/document.types";

/**
 * ============================================================
 * DOCUMENT RELATION OPTION
 * ============================================================
 *
 * value:
 *   MongoDB ObjectId
 *
 * label:
 *   User-visible business identifier
 *
 * Example:
 *
 * {
 *   value: "68a123456789012345678901",
 *   label: "C-001"
 * }
 */
export interface DocumentRelationOption {
  value: string;

  label: string;

  description?: string;
}

/**
 * ============================================================
 * GENERIC API RESPONSE
 * ============================================================
 */
interface ApiListResponse<T> {
  success?: boolean;

  message?: string;

  data?:
    | T[]
    | {
        items?: T[];

        companies?: T[];

        vehicles?: T[];

        drivers?: T[];

        data?: T[];

        pagination?: unknown;
      };

  items?: T[];

  companies?: T[];

  vehicles?: T[];

  drivers?: T[];
}

/**
 * ============================================================
 * RAW COMPANY
 * ============================================================
 *
 * We intentionally keep this flexible because the existing
 * Company API may expose business ID under different names.
 */
interface RawCompany {
  _id?: string;

  id?: string;

  companyId?: string;

  code?: string;

  companyCode?: string;

  name?: string;

  companyName?: string;

  legalName?: string;
}

/**
 * ============================================================
 * RAW VEHICLE
 * ============================================================
 */
interface RawVehicle {
  _id?: string;

  id?: string;

  vehicleNumber?: string;

  registrationNumber?: string;

  registrationNo?: string;

  vehicleId?: string;

  number?: string;

  companyId?:
    | string
    | {
        _id?: string;
      };
}

/**
 * ============================================================
 * RAW DRIVER
 * ============================================================
 */
interface RawDriver {
  _id?: string;

  id?: string;

  employeeId?: string;

  firstName?: string;

  lastName?: string;

  name?: string;

  mobileNumber?: string;

  companyId?:
    | string
    | {
        _id?: string;
      };
}

/**
 * ============================================================
 * GET ID
 * ============================================================
 */
const getObjectId = (item: {
  _id?: string;

  id?: string;
}): string => {
  return item._id || item.id || "";
};

/**
 * ============================================================
 * EXTRACT ARRAY
 * ============================================================
 *
 * Handles common API response structures:
 *
 * 1. { data: [...] }
 *
 * 2. { data: { items: [...] } }
 *
 * 3. { data: { companies: [...] } }
 *
 * 4. { data: { vehicles: [...] } }
 *
 * 5. { data: { drivers: [...] } }
 *
 * 6. { items: [...] }
 */
const extractArray = <T,>(
  response: {
    data?: ApiListResponse<T>;
  },
  resource: "companies" | "vehicles" | "drivers",
): T[] => {
  const payload = response?.data;

  if (!payload) {
    return [];
  }

  /**
   * -----------------------------------------------
   * Direct data array
   * -----------------------------------------------
   */
  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  /**
   * -----------------------------------------------
   * data.items
   * -----------------------------------------------
   */
  if (
    payload.data &&
    !Array.isArray(payload.data) &&
    Array.isArray(payload.data.items)
  ) {
    return payload.data.items;
  }

  /**
   * -----------------------------------------------
   * data.companies / vehicles / drivers
   * -----------------------------------------------
   */
  if (
    payload.data &&
    !Array.isArray(payload.data) &&
    Array.isArray(payload.data[resource])
  ) {
    return payload.data[resource] as T[];
  }

  /**
   * -----------------------------------------------
   * top-level items
   * -----------------------------------------------
   */
  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  /**
   * -----------------------------------------------
   * top-level resource
   * -----------------------------------------------
   */
  if (Array.isArray(payload[resource])) {
    return payload[resource] as T[];
  }

  /**
   * -----------------------------------------------
   * Direct response data array
   * -----------------------------------------------
   */
  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

/**
 * ============================================================
 * EXTRACT COMPANY ID
 * ============================================================
 */
const getCompanyReferenceId = (
  value:
    | string
    | {
        _id?: string;
      }
    | undefined,
): string => {
  if (typeof value === "string") {
    return value;
  }

  return value?._id || "";
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentCreatePage = () => {
  /**
   * ========================================================
   * ROUTER
   * ========================================================
   */
  const navigate = useNavigate();

  /**
   * ========================================================
   * DOCUMENT STORE
   * ========================================================
   */
  const createDocument = useDocumentStore((state) => state.createDocument);

  const isUploading = useDocumentStore((state) => state.isUploading);

  const storeError = useDocumentStore((state) => state.error);

  const clearError = useDocumentStore((state) => state.clearError);

  /**
   * ========================================================
   * LOCAL ERROR
   * ========================================================
   */
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * ========================================================
   * RELATION DATA
   * ========================================================
   */
  const [companies, setCompanies] = useState<DocumentRelationOption[]>([]);

  const [vehicles, setVehicles] = useState<DocumentRelationOption[]>([]);

  const [drivers, setDrivers] = useState<DocumentRelationOption[]>([]);

  /**
   * ========================================================
   * LOADING STATES
   * ========================================================
   */
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);

  /**
   * ========================================================
   * RELATION ERROR
   * ========================================================
   */
  const [relationError, setRelationError] = useState<string | null>(null);

  /**
   * ========================================================
   * SELECTED COMPANY
   * ========================================================
   *
   * This is the actual MongoDB ObjectId.
   */
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  /**
   * ========================================================
   * LOAD COMPANIES
   * ========================================================
   */
  const loadCompanies = async () => {
    setIsLoadingCompanies(true);

    setRelationError(null);

    try {
      /**
       * Expected endpoint:
       *
       * GET /api/v1/companies
       */
      const response = await api.get<ApiListResponse<RawCompany>>("/companies");

      const rawCompanies = extractArray(response, "companies");

      /**
       * Convert backend data to dropdown options.
       */
      const options = rawCompanies
        .map((company) => {
          const value = getObjectId(company);

          const label =
            company.companyId ||
            company.code ||
            company.companyCode ||
            company.name ||
            company.companyName ||
            company.legalName ||
            value;

          const description =
            company.name || company.companyName || company.legalName;

          return {
            value,

            label,

            ...(description && description !== label
              ? {
                  description,
                }
              : {}),
          };
        })
        /**
         * Only valid MongoDB IDs.
         *
         * This prevents invalid values from
         * reaching DocumentForm.
         */
        .filter((option) => /^[0-9a-fA-F]{24}$/.test(option.value));

      setCompanies(options);

      /**
       * If exactly one company exists,
       * automatically select it.
       */
      if (options.length === 1) {
        setSelectedCompanyId(options[0].value);
      }
    } catch (error) {
      console.error("Failed to load companies:", error);

      setRelationError("Unable to load companies. Please try again.");
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  /**
   * ========================================================
   * LOAD VEHICLES
   * ========================================================
   */
  const loadVehicles = async (companyId: string) => {
    if (!companyId) {
      setVehicles([]);

      return;
    }

    setIsLoadingVehicles(true);

    try {
      /**
       * Expected endpoint:
       *
       * GET /api/v1/vehicles?companyId=<ObjectId>
       *
       * The backend may return paginated data.
       */
      const response = await api.get<ApiListResponse<RawVehicle>>("/vehicles", {
        params: {
          companyId,

          page: 1,

          limit: 100,
        },
      });

      const rawVehicles = extractArray(response, "vehicles");

      /**
       * If backend does not filter by company,
       * filter here as an additional safety layer.
       */
      const companyVehicles = rawVehicles.filter((vehicle) => {
        const vehicleCompanyId = getCompanyReferenceId(vehicle.companyId);

        /**
         * If companyId is not present in
         * response, keep it because the
         * backend query already filtered it.
         */
        if (!vehicleCompanyId) {
          return true;
        }

        return vehicleCompanyId === companyId;
      });

      const options = companyVehicles
        .map((vehicle) => {
          const value = getObjectId(vehicle);

          const label =
            vehicle.vehicleNumber ||
            vehicle.registrationNumber ||
            vehicle.registrationNo ||
            vehicle.number ||
            vehicle.vehicleId ||
            value;

          return {
            value,

            label,
          };
        })
        .filter((option) => /^[0-9a-fA-F]{24}$/.test(option.value));

      setVehicles(options);
    } catch (error) {
      console.error("Failed to load vehicles:", error);

      setVehicles([]);

      setRelationError("Unable to load vehicles.");
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  /**
   * ========================================================
   * LOAD DRIVERS
   * ========================================================
   */
  const loadDrivers = async (companyId: string) => {
    if (!companyId) {
      setDrivers([]);

      return;
    }

    setIsLoadingDrivers(true);

    try {
      /**
       * Existing backend log confirms:
       *
       * GET /api/v1/drivers
       *
       * We use companyId as a query filter.
       */
      const response = await api.get<ApiListResponse<RawDriver>>("/drivers", {
        params: {
          companyId,

          page: 1,

          limit: 100,

          sortBy: "createdAt",

          sortOrder: "desc",
        },
      });

      const rawDrivers = extractArray(response, "drivers");

      /**
       * Additional frontend company filter.
       */
      const companyDrivers = rawDrivers.filter((driver) => {
        const driverCompanyId = getCompanyReferenceId(driver.companyId);

        if (!driverCompanyId) {
          return true;
        }

        return driverCompanyId === companyId;
      });

      const options = companyDrivers
        .map((driver) => {
          const value = getObjectId(driver);

          const fullName = [driver.firstName, driver.lastName]
            .filter(Boolean)
            .join(" ");

          const label = fullName || driver.name || driver.employeeId || value;

          const description = driver.employeeId || driver.mobileNumber;

          return {
            value,

            label,

            ...(description && description !== label
              ? {
                  description,
                }
              : {}),
          };
        })
        .filter((option) => /^[0-9a-fA-F]{24}$/.test(option.value));

      setDrivers(options);
    } catch (error) {
      console.error("Failed to load drivers:", error);

      setDrivers([]);

      setRelationError("Unable to load drivers.");
    } finally {
      setIsLoadingDrivers(false);
    }
  };

  /**
   * ========================================================
   * INITIAL COMPANY LOAD
   * ========================================================
   *
   * IMPORTANT:
   *
   * This runs only once.
   *
   * It does NOT create the infinite API call problem
   * you previously had with the drivers page.
   */
  useEffect(() => {
    void loadCompanies();
  }, []);

  /**
   * ========================================================
   * LOAD VEHICLES + DRIVERS
   * ========================================================
   *
   * Only runs when selected company changes.
   */
  useEffect(() => {
    if (!selectedCompanyId) {
      setVehicles([]);

      setDrivers([]);

      return;
    }

    void Promise.all([
      loadVehicles(selectedCompanyId),

      loadDrivers(selectedCompanyId),
    ]);
  }, [selectedCompanyId]);

  /**
   * ========================================================
   * BACK
   * ========================================================
   */
  const handleBack = () => {
    if (isUploading) {
      return;
    }

    navigate("/documents");
  };

  /**
   * ========================================================
   * CANCEL
   * ========================================================
   */
  const handleCancel = () => {
    if (isUploading) {
      return;
    }

    navigate("/documents");
  };

  /**
   * ========================================================
   * SUBMIT
   * ========================================================
   */
  const handleSubmit = async (
    data: CreateDocumentFormData | UpdateDocumentFormData,
  ) => {
    /**
     * CREATE page must contain file.
     */
    if (!("file" in data) || !data.file) {
      setSubmitError("Please select a document file.");

      return;
    }

    /**
     * Clear previous errors.
     */
    setSubmitError(null);

    clearError();

    try {
      /**
       * ------------------------------------------------
       * CREATE DOCUMENT
       * ------------------------------------------------
       */
      const document = await createDocument(data as CreateDocumentFormData);

      /**
       * ------------------------------------------------
       * API FAILED
       * ------------------------------------------------
       */
      if (!document) {
        return;
      }

      /**
       * ------------------------------------------------
       * SUCCESS
       * ------------------------------------------------
       */
      navigate(`/documents/${document._id}`, {
        replace: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to upload document.";

      setSubmitError(message);
    }
  };

  /**
   * ========================================================
   * PAGE ERROR
   * ========================================================
   */
  const pageError = submitError || storeError || relationError;

  /**
   * ========================================================
   * REFRESH RELATIONS
   * ========================================================
   */
  const handleRefreshRelations = async () => {
    setRelationError(null);

    await loadCompanies();

    if (selectedCompanyId) {
      await Promise.all([
        loadVehicles(selectedCompanyId),

        loadDrivers(selectedCompanyId),
      ]);
    }
  };

  /**
   * ========================================================
   * RENDER
   * ========================================================
   */
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Back */}
            <button
              type="button"
              onClick={handleBack}
              disabled={isUploading}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <div>
              <div className="flex items-center gap-2">
                <FileText
                  className="h-5 w-5 text-blue-600"
                  aria-hidden="true"
                />

                <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                  Upload Document
                </h1>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Upload and register a vehicle or driver document for expiry
                monitoring.
              </p>
            </div>
          </div>

          {/* Refresh relations */}
          <button
            type="button"
            onClick={handleRefreshRelations}
            disabled={
              isLoadingCompanies ||
              isLoadingVehicles ||
              isLoadingDrivers ||
              isUploading
            }
            title="Refresh companies, vehicles and drivers"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={[
                "h-4 w-4",

                isLoadingCompanies || isLoadingVehicles || isLoadingDrivers
                  ? "animate-spin"
                  : "",
              ].join(" ")}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>

        {/* ================================================= */}
        {/* PAGE ERROR */}
        {/* ================================================= */}
        {pageError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {pageError}
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* FORM */}
      {/* ================================================== */}
      <DocumentForm
        onSubmit={async (data) => {
          /**
           * Capture selected company from the form.
           *
           * This ensures that when the user selects
           * a company, vehicle/driver loading is triggered.
           */
          if ("companyId" in data && data.companyId) {
            setSelectedCompanyId(data.companyId);
          }

          await handleSubmit(data);
        }}
        onCancel={handleCancel}
        isSubmitting={isUploading}
        serverError={pageError}
        companies={companies}
        vehicles={vehicles}
        drivers={drivers}
        isLoadingCompanies={isLoadingCompanies}
        isLoadingVehicles={isLoadingVehicles}
        isLoadingDrivers={isLoadingDrivers}
      />
    </div>
  );
};

export default DocumentCreatePage;
