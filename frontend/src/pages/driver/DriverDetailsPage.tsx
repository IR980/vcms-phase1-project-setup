import {
  ArrowLeft,
  Edit,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
  Building2,
  BriefcaseBusiness,
  CreditCard,
  Clock3,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { useEffect } from "react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

import DriverStatusBadge from "../../components/driver/DriverStatusBadge";

import { useDriverStore } from "../../store/driver.store";

const DriverDetailsPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const { selectedDriver, loading, error, fetchDriver, clearSelectedDriver } =
    useDriverStore();

  /**
   * Load Driver
   */
  useEffect(() => {
    if (!id) {
      navigate("/drivers");
      return;
    }

    fetchDriver(id);

    return () => {
      clearSelectedDriver();
    };
  }, [id, fetchDriver, clearSelectedDriver, navigate]);

  /**
   * Invalid ID
   */
  if (!id) {
    return null;
  }

  /**
   * Loading
   */
  if (loading && !selectedDriver) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">Loading driver...</p>
        </div>
      </div>
    );
  }

  /**
   * Driver Not Found
   */
  if (!selectedDriver) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <UserRound size={28} className="text-slate-400" />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            Driver not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The requested driver could not be found."}
          </p>

          <Button
            variant="ghost"
            onClick={() => navigate("/drivers")}
            className="mt-5"
          >
            <ArrowLeft size={18} />
            Back to Drivers
          </Button>
        </div>
      </div>
    );
  }

  const driver = selectedDriver;

  /**
   * Full Name
   */
  const fullName = [driver.firstName, driver.lastName]
    .filter(Boolean)
    .join(" ");

  /**
   * Company
   */
  const company =
    typeof driver.companyId === "string" ? null : driver.companyId;

  /**
   * Vehicle
   */
  const vehicle =
    typeof driver.assignedVehicle === "string" ? null : driver.assignedVehicle;

  /**
   * License Expiry
   */
  const licenseExpiry = new Date(driver.licenseExpiryDate);

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  licenseExpiry.setHours(0, 0, 0, 0);

  const licenseDaysRemaining = Math.ceil(
    (licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const licenseExpired = licenseDaysRemaining < 0;

  const licenseExpiringSoon = !licenseExpired && licenseDaysRemaining <= 30;

  /**
   * Format Date
   */
  const formatDate = (value?: string) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/drivers")}
            title="Back to drivers"
          >
            <ArrowLeft size={18} />
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Driver Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View complete driver information
            </p>
          </div>
        </div>

        <Button onClick={() => navigate(`/drivers/${driver._id}/edit`)}>
          <Edit size={18} />
          Edit Driver
        </Button>
      </div>

      {/* Driver Profile Header */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {driver.profilePhoto ? (
              <img
                src={driver.profilePhoto}
                alt={fullName}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 ring-4 ring-slate-100">
                <UserRound size={36} className="text-blue-600" />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {fullName || "Unnamed Driver"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {driver.employeeId
                  ? `Employee ID: ${driver.employeeId}`
                  : "No Employee ID"}
              </p>

              <div className="mt-3">
                <DriverStatusBadge status={driver.status as any} />
              </div>
            </div>
          </div>

          {/* License Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:min-w-70">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={18}
                className={
                  licenseExpired
                    ? "text-red-600"
                    : licenseExpiringSoon
                      ? "text-amber-600"
                      : "text-emerald-600"
                }
              />

              <span className="text-sm font-medium text-slate-600">
                License Expiry
              </span>
            </div>

            <p
              className={`mt-2 text-lg font-bold ${
                licenseExpired
                  ? "text-red-600"
                  : licenseExpiringSoon
                    ? "text-amber-600"
                    : "text-slate-900"
              }`}
            >
              {formatDate(driver.licenseExpiryDate)}
            </p>

            {licenseExpired ? (
              <p className="text-xs font-medium text-red-600">
                License expired
              </p>
            ) : licenseExpiringSoon ? (
              <p className="text-xs font-medium text-amber-600">
                Expires in {licenseDaysRemaining}{" "}
                {licenseDaysRemaining === 1 ? "day" : "days"}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                {licenseDaysRemaining} days remaining
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2.5">
            <UserRound size={20} className="text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Information
            </h2>

            <p className="text-sm text-slate-500">Basic driver information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="First Name" value={driver.firstName} />

          <InfoItem label="Last Name" value={driver.lastName} />

          <InfoItem label="Employee ID" value={driver.employeeId} />

          <InfoItem
            label="Date of Birth"
            value={formatDate(driver.dateOfBirth)}
          />

          <InfoItem
            label="Gender"
            value={driver.gender ? formatLabel(driver.gender) : "-"}
          />
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2.5">
            <Phone size={20} className="text-emerald-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Contact Information
            </h2>

            <p className="text-sm text-slate-500">
              Contact and address details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Mobile Number"
            value={driver.mobileNumber}
            icon={<Phone size={15} />}
          />

          <InfoItem
            label="Email"
            value={driver.email}
            icon={<Mail size={15} />}
          />

          <InfoItem label="City" value={driver.city} />

          <InfoItem label="State" value={driver.state} />

          <InfoItem label="Pincode" value={driver.pincode} />

          <InfoItem
            label="Address"
            value={driver.address}
            icon={<MapPin size={15} />}
          />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Emergency Contact
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoItem
              label="Contact Name"
              value={driver.emergencyContactName}
            />

            <InfoItem
              label="Contact Number"
              value={driver.emergencyContactNumber}
              icon={<Phone size={15} />}
            />
          </div>
        </div>
      </Card>

      {/* License Information */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2.5">
            <CreditCard size={20} className="text-amber-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Driving License
            </h2>

            <p className="text-sm text-slate-500">
              License and issuing authority
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="License Number" value={driver.licenseNumber} />

          <InfoItem
            label="License Type"
            value={formatLabel(driver.licenseType)}
          />

          <InfoItem
            label="Issue Date"
            value={formatDate(driver.licenseIssueDate)}
          />

          <InfoItem
            label="Expiry Date"
            value={formatDate(driver.licenseExpiryDate)}
          />

          <InfoItem label="Issuing Authority" value={driver.issuingAuthority} />
        </div>
      </Card>

      {/* Employment & Assignment */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-violet-100 p-2.5">
            <BriefcaseBusiness size={20} className="text-violet-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Employment & Assignment
            </h2>

            <p className="text-sm text-slate-500">
              Company, employment, and vehicle information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Company"
            value={
              company?.companyName || driver.companyId
                ? typeof driver.companyId === "string"
                  ? driver.companyId
                  : company?.companyName
                : "-"
            }
            icon={<Building2 size={15} />}
          />

          <InfoItem label="Legal Name" value={company?.legalName} />

          <InfoItem
            label="Joining Date"
            value={formatDate(driver.joiningDate)}
          />

          <InfoItem label="Department" value={driver.department} />

          <InfoItem
            label="Assigned Vehicle"
            value={
              vehicle?.vehicleNumber ||
              (typeof driver.assignedVehicle === "string"
                ? driver.assignedVehicle
                : "-")
            }
            icon={<Truck size={15} />}
          />

          <InfoItem
            label="Vehicle Model"
            value={
              vehicle
                ? [vehicle.manufacturer, vehicle.vehicleModel]
                    .filter(Boolean)
                    .join(" ")
                : "-"
            }
          />

          <InfoItem
            label="Vehicle Type"
            value={
              vehicle?.vehicleType ? formatLabel(vehicle.vehicleType) : "-"
            }
          />

          <InfoItem
            label="Vehicle Registration"
            value={vehicle?.registrationNumber}
          />
        </div>
      </Card>

      {/* Audit Information */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2.5">
            <Clock3 size={20} className="text-slate-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Record Information
            </h2>

            <p className="text-sm text-slate-500">
              Record creation and modification details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Created At"
            value={formatDateTime(driver.createdAt)}
          />

          <InfoItem
            label="Updated At"
            value={formatDateTime(driver.updatedAt)}
          />

          <InfoItem label="Driver ID" value={driver._id} />
        </div>
      </Card>
    </div>
  );
};

/**
 * Information Item
 */
interface InfoItemProps {
  label: string;

  value?: string | null;

  icon?: React.ReactNode;
}

const InfoItem = ({ label, value, icon }: InfoItemProps) => {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-1 wrap-break-word text-sm font-medium text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
};

/**
 * Format Label
 */
const formatLabel = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format Date & Time
 */
const formatDateTime = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default DriverDetailsPage;
