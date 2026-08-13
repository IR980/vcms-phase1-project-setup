import { useEffect } from "react";

import CompanyHeader from "../../components/company/CompanyHeader";
import CompanyTable from "../../components/company/CompanyTable";
import Pagination from "../../components/common/Pagination";

import { useCompanyStore } from "../../store/company.store";

const CompanyListPage = () => {
  const {
    companies,
    loading,
    pagination,
    query,
    fetchCompanies,
    setQuery,
    removeCompany,
  } = useCompanyStore();

  useEffect(() => {
    void fetchCompanies();
  }, [
    query.page,
    query.limit,
    query.search,
    query.status,
    query.sortBy,
    query.sortOrder,
  ]);

  const handleSearch = (value: string) => {
    setQuery({
      search: value,
      page: 1,
    });
  };

  const handleRefresh = () => {
    void fetchCompanies();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this company?",
    );

    if (!confirmed) return;

    await removeCompany(id);

    await fetchCompanies();
  };

  return (
    <div className="space-y-6">
      <CompanyHeader
        searchValue={query.search ?? ""}
        loading={loading}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      />

      <CompanyTable
        companies={companies}
        loading={loading}
        onDelete={handleDelete}
      />

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) =>
            setQuery({
              page,
            })
          }
        />
      )}
    </div>
  );
};

export default CompanyListPage;
