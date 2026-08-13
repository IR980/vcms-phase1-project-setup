import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";

import { UserRole } from "../types/auth.types";

// ============================================================
// AUTH
// ============================================================

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// ============================================================
// COMMON / DASHBOARD
// ============================================================

import DashboardPage from "../pages/dashboard/DashboardPage";

import UnauthorizedPage from "../pages/common/UnauthorizedPage";
import NotFoundPage from "../pages/common/NotFoundPage";

// ============================================================
// COMPANY
// ============================================================

import CompanyCreatePage from "../pages/company/CompanyCreatePage";
import CompanyEditPage from "../pages/company/CompanyEditPage";
import CompanyDetailsPage from "../pages/company/CompanyDetailsPage";
import CompanyListPage from "../pages/company/CompanyListPage";

// ============================================================
// VEHICLES
// ============================================================

import VehicleListPage from "../pages/vehicle/VehicleListPage";
import VehicleCreatePage from "../pages/vehicle/VehicleCreatePage";
import VehicleEditPage from "../pages/vehicle/VehicleEditPage";
import VehicleDetailsPage from "../pages/vehicle/VehicleDetailsPage";

// ============================================================
// DRIVERS
// ============================================================

import DriverListPage from "../pages/driver/DriverListPage";
import DriverCreatePage from "../pages/driver/DriverCreatePage";
import DriverDetailsPage from "../pages/driver/DriverDetailsPage";
import DriverEditPage from "../pages/driver/DriverEditPage";

// ============================================================
// DOCUMENTS
// ============================================================

import DocumentListPage from "../pages/document/DocumentListPage";
import DocumentCreatePage from "../pages/document/DocumentCreatePage";
import DocumentDetailsPage from "../pages/document/DocumentDetailsPage";
import DocumentEditPage from "../pages/document/DocumentEditPage";
import DocumentCompliancePage from "../pages/document/DocumentCompliancePage";

// ============================================================
// EXPIRY
// ============================================================

import ExpiryDashboardPage from "../pages/expiry/ExpiryDashboardPage";
import ExpiryListPage from "../pages/expiry/ExpiryListPage";

/**
 * ============================================================
 * APP ROUTES
 * ============================================================
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================== */}
        {/* PUBLIC ROUTES */}
        {/* ================================================== */}

        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* ================================================== */}
        {/* PROTECTED ROUTES */}
        {/* ================================================== */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                UserRole.SUPER_ADMIN,
                UserRole.COMPANY_ADMIN,
                UserRole.FLEET_MANAGER,
                UserRole.STAFF,
                UserRole.DRIVER,
              ]}
            />
          }
        >
          {/* ================================================== */}
          {/* DASHBOARD LAYOUT */}
          {/* ================================================== */}

          <Route element={<DashboardLayout />}>
            {/* ================================================== */}
            {/* MAIN DASHBOARD */}
            {/* ================================================== */}

            <Route path="dashboard" element={<DashboardPage />} />

            {/* ================================================== */}
            {/* COMPANY */}
            {/* ================================================== */}

            <Route path="companies" element={<CompanyListPage />} />

            <Route path="companies/create" element={<CompanyCreatePage />} />

            <Route path="companies/:id/edit" element={<CompanyEditPage />} />

            <Route path="companies/:id" element={<CompanyDetailsPage />} />

            {/* ================================================== */}
            {/* VEHICLES */}
            {/* ================================================== */}

            <Route path="vehicles" element={<VehicleListPage />} />

            <Route path="vehicles/create" element={<VehicleCreatePage />} />

            <Route path="vehicles/:id/edit" element={<VehicleEditPage />} />

            <Route path="vehicles/:id" element={<VehicleDetailsPage />} />

            {/* ================================================== */}
            {/* DRIVERS */}
            {/* ================================================== */}

            <Route path="drivers" element={<DriverListPage />} />

            <Route path="drivers/create" element={<DriverCreatePage />} />

            <Route path="drivers/:id/edit" element={<DriverEditPage />} />

            <Route path="drivers/:id" element={<DriverDetailsPage />} />

            {/* ================================================== */}
            {/* DOCUMENTS */}
            {/* ================================================== */}

            <Route path="documents" element={<DocumentListPage />} />

            <Route path="documents/new" element={<DocumentCreatePage />} />

            <Route
              path="documents/compliance"
              element={<DocumentCompliancePage />}
            />

            <Route path="documents/:id/edit" element={<DocumentEditPage />} />

            <Route path="documents/:id" element={<DocumentDetailsPage />} />

            {/* ================================================== */}
            {/* EXPIRY MODULE */}
            {/* ================================================== */}

            <Route path="expiry" element={<ExpiryDashboardPage />} />

            <Route path="expiry/list" element={<ExpiryListPage />} />
          </Route>
        </Route>

        {/* ================================================== */}
        {/* COMMON */}
        {/* ================================================== */}

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ================================================== */}
        {/* DEFAULT */}
        {/* ================================================== */}

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ================================================== */}
        {/* 404 */}
        {/* ================================================== */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
