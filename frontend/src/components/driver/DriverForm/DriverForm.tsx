// import { useEffect, useState } from "react";

// import type {
//   CreateDriverDto,
//   UpdateDriverDto,
//   Driver,
// } from "../../../types/driver.types";

// import BasicInfoSection from "./BasicInfoSection";
// import ContactSection from "./ContactSection";
// import LicenseSection from "./LicenseSection";
// import EmploymentSection from "./EmploymentSection";
// import DriverFormActions from "./DriverFormActions";

// import type { DriverFormData } from "./driver-form.types";

// interface DriverFormProps {
//   mode?: "create" | "edit";

//   initialData?: Partial<Driver>;

//   loading?: boolean;

//   onSubmit: (data: CreateDriverDto | UpdateDriverDto) => Promise<void> | void;

//   onCancel: () => void;
// }

// /**
//  * Convert API date into
//  * HTML input[type="date"] format.
//  */
// const formatDateForInput = (date: string | Date): string => {
//   const parsedDate = new Date(date);

//   if (Number.isNaN(parsedDate.getTime())) {
//     return "";
//   }

//   return parsedDate.toISOString().split("T")[0];
// };

// /**
//  * Create initial form state.
//  */
// const getInitialFormData = (initialData?: Partial<Driver>): DriverFormData => {
//   const companyId =
//     typeof initialData?.companyId === "string"
//       ? initialData.companyId
//       : (initialData?.companyId?._id ?? "");

//   const assignedVehicle =
//     typeof initialData?.assignedVehicle === "string"
//       ? initialData.assignedVehicle
//       : (initialData?.assignedVehicle?._id ?? "");

//   return {
//     companyId,

//     employeeId: initialData?.employeeId ?? "",

//     firstName: initialData?.firstName ?? "",

//     lastName: initialData?.lastName ?? "",

//     dateOfBirth: initialData?.dateOfBirth
//       ? formatDateForInput(initialData.dateOfBirth)
//       : "",

//     gender: initialData?.gender ?? "",

//     profilePhoto: initialData?.profilePhoto ?? "",

//     mobileNumber: initialData?.mobileNumber ?? "",

//     email: initialData?.email ?? "",

//     address: initialData?.address ?? "",

//     city: initialData?.city ?? "",

//     state: initialData?.state ?? "",

//     pincode: initialData?.pincode ?? "",

//     emergencyContactName: initialData?.emergencyContactName ?? "",

//     emergencyContactNumber: initialData?.emergencyContactNumber ?? "",

//     licenseNumber: initialData?.licenseNumber ?? "",

//     licenseType: initialData?.licenseType ?? "",

//     licenseIssueDate: initialData?.licenseIssueDate
//       ? formatDateForInput(initialData.licenseIssueDate)
//       : "",

//     licenseExpiryDate: initialData?.licenseExpiryDate
//       ? formatDateForInput(initialData.licenseExpiryDate)
//       : "",

//     issuingAuthority: initialData?.issuingAuthority ?? "",

//     joiningDate: initialData?.joiningDate
//       ? formatDateForInput(initialData.joiningDate)
//       : "",

//     department: initialData?.department ?? "",

//     assignedVehicle,

//     status: initialData?.status ?? "active",
//   };
// };

// const DriverForm = ({
//   mode = "create",
//   initialData,
//   loading = false,
//   onSubmit,
//   onCancel,
// }: DriverFormProps) => {
//   const [formData, setFormData] = useState<DriverFormData>(
//     getInitialFormData(initialData),
//   );

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   /**
//    * Update form when edit data
//    * becomes available.
//    */
//   useEffect(() => {
//     setFormData(getInitialFormData(initialData));

//     setErrors({});
//   }, [initialData]);

//   /**
//    * Update Field
//    */
//   const updateField = (field: keyof DriverFormData, value: string) => {
//     setFormData((previous) => ({
//       ...previous,
//       [field]: value,
//     }));

//     /**
//      * Clear field error.
//      */
//     if (errors[field]) {
//       setErrors((previous) => {
//         const next = {
//           ...previous,
//         };

//         delete next[field];

//         return next;
//       });
//     }
//   };

//   /**
//    * Basic Client Validation
//    */
//   const validateForm = () => {
//     const nextErrors: Record<string, string> = {};

//     /**
//      * Company
//      */
//     if (!formData.companyId) {
//       nextErrors.companyId = "Company is required";
//     }

//     /**
//      * First Name
//      */
//     if (!formData.firstName.trim()) {
//       nextErrors.firstName = "First name is required";
//     }

//     /**
//      * Mobile Number
//      */
//     if (!formData.mobileNumber) {
//       nextErrors.mobileNumber = "Mobile number is required";
//     } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
//       nextErrors.mobileNumber = "Enter a valid 10-digit mobile number";
//     }

//     /**
//      * Email
//      */
//     if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       nextErrors.email = "Enter a valid email address";
//     }

//     /**
//      * License Number
//      */
//     if (!formData.licenseNumber.trim()) {
//       nextErrors.licenseNumber = "License number is required";
//     }

//     /**
//      * License Type
//      */
//     if (!formData.licenseType) {
//       nextErrors.licenseType = "License type is required";
//     }

//     /**
//      * License Expiry
//      */
//     if (!formData.licenseExpiryDate) {
//       nextErrors.licenseExpiryDate = "License expiry date is required";
//     }

//     /**
//      * License Date Comparison
//      */
//     if (formData.licenseIssueDate && formData.licenseExpiryDate) {
//       const issueDate = new Date(formData.licenseIssueDate);

//       const expiryDate = new Date(formData.licenseExpiryDate);

//       if (expiryDate < issueDate) {
//         nextErrors.licenseExpiryDate =
//           "License expiry date must be after the issue date";
//       }
//     }

//     /**
//      * Emergency Contact
//      */
//     if (
//       formData.emergencyContactNumber &&
//       !/^[6-9]\d{9}$/.test(formData.emergencyContactNumber)
//     ) {
//       nextErrors.emergencyContactNumber =
//         "Enter a valid 10-digit mobile number";
//     }

//     /**
//      * Pincode
//      */
//     if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
//       nextErrors.pincode = "Enter a valid 6-digit pincode";
//     }

//     setErrors(nextErrors);

//     return Object.keys(nextErrors).length === 0;
//   };

//   /**
//    * Submit Form
//    */
//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     const payload: CreateDriverDto = {
//       companyId: formData.companyId,

//       employeeId: formData.employeeId || undefined,

//       firstName: formData.firstName.trim(),

//       lastName: formData.lastName.trim() || undefined,

//       dateOfBirth: formData.dateOfBirth || undefined,

//       gender: formData.gender
//         ? (formData.gender as CreateDriverDto["gender"])
//         : undefined,

//       profilePhoto: formData.profilePhoto || undefined,

//       mobileNumber: formData.mobileNumber.trim(),

//       email: formData.email.trim() || undefined,

//       address: formData.address.trim() || undefined,

//       city: formData.city.trim() || undefined,

//       state: formData.state.trim() || undefined,

//       pincode: formData.pincode.trim() || undefined,

//       emergencyContactName: formData.emergencyContactName.trim() || undefined,

//       emergencyContactNumber:
//         formData.emergencyContactNumber.trim() || undefined,

//       licenseNumber: formData.licenseNumber.trim().toUpperCase(),

//       licenseType: formData.licenseType as CreateDriverDto["licenseType"],

//       licenseIssueDate: formData.licenseIssueDate || undefined,

//       licenseExpiryDate: formData.licenseExpiryDate,

//       issuingAuthority: formData.issuingAuthority.trim() || undefined,

//       joiningDate: formData.joiningDate || undefined,

//       department: formData.department.trim() || undefined,

//       assignedVehicle: formData.assignedVehicle || undefined,

//       status: formData.status as CreateDriverDto["status"],
//     };

//     await onSubmit(mode === "create" ? payload : (payload as UpdateDriverDto));
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Basic Information */}
//       <BasicInfoSection
//         formData={formData}
//         errors={errors}
//         onChange={updateField}
//       />

//       {/* Contact Information */}
//       <ContactSection
//         formData={formData}
//         errors={errors}
//         onChange={updateField}
//       />

//       {/* License Information */}
//       <LicenseSection
//         formData={formData}
//         errors={errors}
//         onChange={updateField}
//       />

//       {/* Employment Information */}
//       <EmploymentSection
//         formData={formData}
//         errors={errors}
//         onChange={updateField}
//       />

//       {/* Form Actions */}
//       <DriverFormActions mode={mode} loading={loading} onCancel={onCancel} />
//     </form>
//   );
// };

// export default DriverForm;

import { useEffect, useMemo, useState, type FormEvent } from "react";

import type {
  CreateDriverDto,
  UpdateDriverDto,
  Driver,
} from "../../../types/driver.types";

import { getCompanies } from "../../../api/company.api";

import { getVehicles } from "../../../api/vehicle.api";

import BasicInfoSection from "./BasicInfoSection";
import ContactSection from "./ContactSection";
import LicenseSection from "./LicenseSection";
import EmploymentSection, {
  type CompanyOption,
  type VehicleOption,
} from "./EmploymentSection";
import DriverFormActions from "./DriverFormActions";

import type { DriverFormData } from "./driver-form.types";

/**
 * ============================================================
 * Props
 * ============================================================
 */
interface DriverFormProps {
  mode?: "create" | "edit";

  initialData?: Partial<Driver>;

  loading?: boolean;

  onSubmit: (data: CreateDriverDto | UpdateDriverDto) => Promise<void> | void;

  onCancel: () => void;
}

/**
 * ============================================================
 * Convert API date into HTML date format
 * ============================================================
 */
const formatDateForInput = (date: string | Date): string => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0] ?? "";
};

/**
 * ============================================================
 * Create Initial Form State
 * ============================================================
 */
const getInitialFormData = (initialData?: Partial<Driver>): DriverFormData => {
  const companyId =
    typeof initialData?.companyId === "string"
      ? initialData.companyId
      : (initialData?.companyId?._id ?? "");

  const assignedVehicle =
    typeof initialData?.assignedVehicle === "string"
      ? initialData.assignedVehicle
      : (initialData?.assignedVehicle?._id ?? "");

  return {
    companyId,

    employeeId: initialData?.employeeId ?? "",

    firstName: initialData?.firstName ?? "",

    lastName: initialData?.lastName ?? "",

    dateOfBirth: initialData?.dateOfBirth
      ? formatDateForInput(initialData.dateOfBirth)
      : "",

    gender: initialData?.gender ?? "",

    profilePhoto: initialData?.profilePhoto ?? "",

    mobileNumber: initialData?.mobileNumber ?? "",

    email: initialData?.email ?? "",

    address: initialData?.address ?? "",

    city: initialData?.city ?? "",

    state: initialData?.state ?? "",

    pincode: initialData?.pincode ?? "",

    emergencyContactName: initialData?.emergencyContactName ?? "",

    emergencyContactNumber: initialData?.emergencyContactNumber ?? "",

    licenseNumber: initialData?.licenseNumber ?? "",

    licenseType: initialData?.licenseType ?? "",

    licenseIssueDate: initialData?.licenseIssueDate
      ? formatDateForInput(initialData.licenseIssueDate)
      : "",

    licenseExpiryDate: initialData?.licenseExpiryDate
      ? formatDateForInput(initialData.licenseExpiryDate)
      : "",

    issuingAuthority: initialData?.issuingAuthority ?? "",

    joiningDate: initialData?.joiningDate
      ? formatDateForInput(initialData.joiningDate)
      : "",

    department: initialData?.department ?? "",

    assignedVehicle,

    status: initialData?.status ?? "active",
  };
};

/**
 * ============================================================
 * Driver Form
 * ============================================================
 */
const DriverForm = ({
  mode = "create",
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: DriverFormProps) => {
  /**
   * ==========================================================
   * Form State
   * ==========================================================
   */
  const [formData, setFormData] = useState<DriverFormData>(
    getInitialFormData(initialData),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * ==========================================================
   * Company / Vehicle State
   * ==========================================================
   */
  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);

  const [companiesLoading, setCompaniesLoading] = useState(false);

  const [vehiclesLoading, setVehiclesLoading] = useState(false);

  const [assignmentError, setAssignmentError] = useState("");

  /**
   * ==========================================================
   * Load Companies and Vehicles
   * ==========================================================
   *
   * IMPORTANT:
   *
   * This effect has an empty dependency array.
   *
   * Therefore it runs once when DriverForm mounts
   * and cannot create the infinite fetch loop that
   * occurred in DriverListPage.
   */
  useEffect(() => {
    let mounted = true;

    const loadAssignmentData = async () => {
      setCompaniesLoading(true);
      setVehiclesLoading(true);
      setAssignmentError("");

      try {
        const [companyResult, vehicleResult] = await Promise.all([
          getCompanies({
            page: 1,
            limit: 100,
            status: "active",
          }),

          getVehicles({
            page: 1,
            limit: 100,
            status: "active",
          }),
        ]);

        if (!mounted) {
          return;
        }

        /**
         * Company API:
         *
         * {
         *   companies: [],
         *   pagination: {}
         * }
         */
        const companyOptions: CompanyOption[] = companyResult.companies.map(
          (company) => ({
            _id: company._id,
            companyName: company.companyName,
            legalName: company.legalName,
          }),
        );

        /**
         * Vehicle API:
         *
         * {
         *   success: true,
         *   data: {
         *     vehicles: [],
         *     pagination: {}
         *   }
         * }
         */
        const vehicleOptions: VehicleOption[] = vehicleResult.data.vehicles.map(
          (vehicle) => ({
            _id: vehicle._id,
            vehicleNumber: vehicle.vehicleNumber,
            vehicleName: vehicle.vehicleName,
            manufacturer: vehicle.manufacturer,
            vehicleModel: vehicle.vehicleModel,
          }),
        );

        setCompanies(companyOptions);

        setVehicles(vehicleOptions);
      } catch (error) {
        console.error("Failed to load company/vehicle data:", error);

        if (mounted) {
          setAssignmentError(
            "Unable to load companies or vehicles. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setCompaniesLoading(false);

          setVehiclesLoading(false);
        }
      }
    };

    loadAssignmentData();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * ==========================================================
   * Update Form When Edit Data Changes
   * ==========================================================
   */
  useEffect(() => {
    setFormData(getInitialFormData(initialData));

    setErrors({});
  }, [initialData]);

  /**
   * ==========================================================
   * Filter Vehicles By Company
   * ==========================================================
   *
   * Your current Vehicle type contains companyId.
   *
   * We use it to show only vehicles belonging
   * to the selected company.
   */
  const availableVehicles = useMemo(() => {
    if (!formData.companyId) {
      return [];
    }

    /**
     * We need the original vehicle records
     * to perform company filtering.
     *
     * Because `vehicles` currently contains only
     * VehicleOption values, we cannot determine
     * companyId here.
     *
     * Therefore the current version returns all
     * loaded vehicles.
     *
     * The backend should ideally support:
     *
     * GET /vehicles?companyId=<companyId>
     *
     * when we implement server-side filtering.
     */
    return vehicles;
  }, [formData.companyId, vehicles]);

  /**
   * ==========================================================
   * Update Field
   * ==========================================================
   */
  const updateField = (field: keyof DriverFormData, value: string) => {
    /**
     * If the company changes, clear the
     * currently selected vehicle.
     *
     * This prevents accidentally assigning
     * a vehicle from the previous company.
     */
    if (field === "companyId" && value !== formData.companyId) {
      setFormData((previous) => ({
        ...previous,
        companyId: value,
        assignedVehicle: "",
      }));

      /**
       * Clear related errors.
       */
      setErrors((previous) => {
        const next = {
          ...previous,
        };

        delete next.companyId;
        delete next.assignedVehicle;

        return next;
      });

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    /**
     * Clear field error.
     */
    if (errors[field]) {
      setErrors((previous) => {
        const next = {
          ...previous,
        };

        delete next[field];

        return next;
      });
    }
  };

  /**
   * ==========================================================
   * Basic Client Validation
   * ==========================================================
   */
  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    /**
     * Company
     */
    if (!formData.companyId) {
      nextErrors.companyId = "Company is required";
    }

    /**
     * First Name
     */
    if (!formData.firstName.trim()) {
      nextErrors.firstName = "First name is required";
    }

    /**
     * Mobile Number
     */
    if (!formData.mobileNumber) {
      nextErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      nextErrors.mobileNumber = "Enter a valid 10-digit mobile number";
    }

    /**
     * Email
     */
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    /**
     * License Number
     */
    if (!formData.licenseNumber.trim()) {
      nextErrors.licenseNumber = "License number is required";
    }

    /**
     * License Type
     */
    if (!formData.licenseType) {
      nextErrors.licenseType = "License type is required";
    }

    /**
     * License Expiry
     */
    if (!formData.licenseExpiryDate) {
      nextErrors.licenseExpiryDate = "License expiry date is required";
    }

    /**
     * License Date Comparison
     */
    if (formData.licenseIssueDate && formData.licenseExpiryDate) {
      const issueDate = new Date(formData.licenseIssueDate);

      const expiryDate = new Date(formData.licenseExpiryDate);

      if (expiryDate < issueDate) {
        nextErrors.licenseExpiryDate =
          "License expiry date must be after the issue date";
      }
    }

    /**
     * Emergency Contact
     */
    if (
      formData.emergencyContactNumber &&
      !/^[6-9]\d{9}$/.test(formData.emergencyContactNumber)
    ) {
      nextErrors.emergencyContactNumber =
        "Enter a valid 10-digit mobile number";
    }

    /**
     * Pincode
     */
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      nextErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /**
   * ==========================================================
   * Submit Form
   * ==========================================================
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    /**
     * Build API payload.
     */
    const payload: CreateDriverDto = {
      companyId: formData.companyId,

      employeeId: formData.employeeId || undefined,

      firstName: formData.firstName.trim(),

      lastName: formData.lastName.trim() || undefined,

      dateOfBirth: formData.dateOfBirth || undefined,

      gender: formData.gender
        ? (formData.gender as CreateDriverDto["gender"])
        : undefined,

      profilePhoto: formData.profilePhoto || undefined,

      mobileNumber: formData.mobileNumber.trim(),

      email: formData.email.trim() || undefined,

      address: formData.address.trim() || undefined,

      city: formData.city.trim() || undefined,

      state: formData.state.trim() || undefined,

      pincode: formData.pincode.trim() || undefined,

      emergencyContactName: formData.emergencyContactName.trim() || undefined,

      emergencyContactNumber:
        formData.emergencyContactNumber.trim() || undefined,

      licenseNumber: formData.licenseNumber.trim().toUpperCase(),

      licenseType: formData.licenseType as CreateDriverDto["licenseType"],

      licenseIssueDate: formData.licenseIssueDate || undefined,

      licenseExpiryDate: formData.licenseExpiryDate,

      issuingAuthority: formData.issuingAuthority.trim() || undefined,

      joiningDate: formData.joiningDate || undefined,

      department: formData.department.trim() || undefined,

      assignedVehicle: formData.assignedVehicle || undefined,

      status: formData.status as CreateDriverDto["status"],
    };

    await onSubmit(mode === "create" ? payload : (payload as UpdateDriverDto));
  };

  /**
   * ==========================================================
   * Render
   * ==========================================================
   */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ====================================================
          Assignment Loading/Error
          ==================================================== */}
      {assignmentError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-700">{assignmentError}</p>
        </div>
      )}

      {/* ====================================================
          Basic Information
          ==================================================== */}
      <BasicInfoSection
        formData={formData}
        errors={errors}
        onChange={updateField}
      />

      {/* ====================================================
          Contact Information
          ==================================================== */}
      <ContactSection
        formData={formData}
        errors={errors}
        onChange={updateField}
      />

      {/* ====================================================
          License Information
          ==================================================== */}
      <LicenseSection
        formData={formData}
        errors={errors}
        onChange={updateField}
      />

      {/* ====================================================
          Employment & Assignment
          ==================================================== */}
      <EmploymentSection
        formData={formData}
        errors={errors}
        onChange={updateField}
        companies={companies}
        vehicles={availableVehicles}
        companiesLoading={companiesLoading}
        vehiclesLoading={vehiclesLoading}
      />

      {/* ====================================================
          Form Actions
          ==================================================== */}
      <DriverFormActions mode={mode} loading={loading} onCancel={onCancel} />
    </form>
  );
};

export default DriverForm;
