import { Eye, Pencil, Trash2, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Company } from "../../types/company.types";
import CompanyStatusBadge from "./CompanyStatusBadge";

interface CompanyTableProps {
  companies: Company[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const CompanyTable = ({
  companies,
  loading = false,
  onDelete,
}: CompanyTableProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
        <Building2 className="mx-auto mb-4 text-slate-400" size={60} />

        <h2 className="text-xl font-semibold text-slate-700">
          No Companies Found
        </h2>

        <p className="mt-2 text-slate-500">
          Create your first company to start managing your fleet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Company
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Owner
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vehicles
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Drivers
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Documents
              </th>

              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => (
              <tr key={company._id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {company.companyName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {company.city}, {company.state}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">{company.ownerName}</td>

                <td className="px-6 py-4">{company.email}</td>

                <td className="px-6 py-4 text-center">
                  {company.totalVehicles}
                </td>

                <td className="px-6 py-4 text-center">
                  {company.totalDrivers}
                </td>

                <td className="px-6 py-4 text-center">
                  {company.totalDocuments}
                </td>

                <td className="px-6 py-4 text-center">
                  <CompanyStatusBadge status={company.status} size="sm" />
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/companies/${company._id}`)}
                      className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/companies/${company._id}/edit`)}
                      className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.(company._id)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyTable;
