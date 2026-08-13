export interface DriverFormData {
  companyId: string;

  employeeId: string;

  firstName: string;

  lastName: string;

  dateOfBirth: string;

  gender: string;

  profilePhoto: string;

  mobileNumber: string;

  email: string;

  address: string;

  city: string;

  state: string;

  pincode: string;

  emergencyContactName: string;

  emergencyContactNumber: string;

  licenseNumber: string;

  licenseType: string;

  licenseIssueDate: string;

  licenseExpiryDate: string;

  issuingAuthority: string;

  joiningDate: string;

  department: string;

  assignedVehicle: string;

  status: string;
}

export type DriverFormErrors = Record<string, string>;

export type DriverFormChangeHandler = (
  field: keyof DriverFormData,
  value: string,
) => void;
