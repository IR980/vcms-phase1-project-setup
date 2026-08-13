export const DRIVER_GENDER = {
  MALE: "male",
  FEMALE: "female",
  OTHER: "other",
} as const;

export type DriverGender = (typeof DRIVER_GENDER)[keyof typeof DRIVER_GENDER];

export const DRIVER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ON_LEAVE: "on_leave",
  SUSPENDED: "suspended",
  TERMINATED: "terminated",
} as const;

export type DriverStatus = (typeof DRIVER_STATUS)[keyof typeof DRIVER_STATUS];

export const LICENSE_TYPE = {
  LMV: "lmv",
  HMV: "hmv",
  HGMV: "hgmv",
  TRANSPORT: "transport",
  COMMERCIAL: "commercial",
  OTHER: "other",
} as const;

export type LicenseType = (typeof LICENSE_TYPE)[keyof typeof LICENSE_TYPE];

/**
 * Driver Status Options
 */
export const DRIVER_STATUS_OPTIONS = [
  {
    label: "Active",
    value: DRIVER_STATUS.ACTIVE,
  },
  {
    label: "Inactive",
    value: DRIVER_STATUS.INACTIVE,
  },
  {
    label: "On Leave",
    value: DRIVER_STATUS.ON_LEAVE,
  },
  {
    label: "Suspended",
    value: DRIVER_STATUS.SUSPENDED,
  },
  {
    label: "Terminated",
    value: DRIVER_STATUS.TERMINATED,
  },
];

/**
 * Driver Gender Options
 */
export const DRIVER_GENDER_OPTIONS = [
  {
    label: "Male",
    value: DRIVER_GENDER.MALE,
  },
  {
    label: "Female",
    value: DRIVER_GENDER.FEMALE,
  },
  {
    label: "Other",
    value: DRIVER_GENDER.OTHER,
  },
];

/**
 * License Type Options
 */
export const LICENSE_TYPE_OPTIONS = [
  {
    label: "LMV",
    value: LICENSE_TYPE.LMV,
  },
  {
    label: "HMV",
    value: LICENSE_TYPE.HMV,
  },
  {
    label: "HGMV",
    value: LICENSE_TYPE.HGMV,
  },
  {
    label: "Transport",
    value: LICENSE_TYPE.TRANSPORT,
  },
  {
    label: "Commercial",
    value: LICENSE_TYPE.COMMERCIAL,
  },
  {
    label: "Other",
    value: LICENSE_TYPE.OTHER,
  },
];

/**
 * Driver Sort Options
 */
export const DRIVER_SORT_OPTIONS = [
  {
    label: "First Name",
    value: "firstName",
  },
  {
    label: "Last Name",
    value: "lastName",
  },
  {
    label: "Employee ID",
    value: "employeeId",
  },
  {
    label: "License Expiry",
    value: "licenseExpiryDate",
  },
  {
    label: "Joining Date",
    value: "joiningDate",
  },
  {
    label: "Created Date",
    value: "createdAt",
  },
] as const;

/**
 * Driver Page Sizes
 */
export const DRIVER_PAGE_SIZES = [10, 20, 50, 100] as const;

/**
 * Default Driver Query
 */
export const DEFAULT_DRIVER_QUERY = {
  page: 1,
  limit: 10,
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
} as const;
