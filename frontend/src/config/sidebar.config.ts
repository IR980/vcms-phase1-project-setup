import {
  LayoutDashboard,
  Building2,
  Truck,
  Users,
  FileText,
  ScanSearch,
  BellRing,
  BarChart3,
  Settings,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";

import { UserRole } from "../types/auth.types";

/**
 * ============================================================
 * SIDEBAR ITEM
 * ============================================================
 */
export interface SidebarItem {
  title: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

/**
 * ============================================================
 * SIDEBAR ITEMS
 * ============================================================
 */
export const sidebarItems: SidebarItem[] = [
  /**
   * ==========================================================
   * DASHBOARD
   * ==========================================================
   */
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.COMPANY_ADMIN,
      UserRole.FLEET_MANAGER,
      UserRole.STAFF,
    ],
  },

  /**
   * ==========================================================
   * COMPANIES
   * ==========================================================
   */
  {
    title: "Companies",
    path: "/companies",
    icon: Building2,
    roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN],
  },

  /**
   * ==========================================================
   * VEHICLES
   * ==========================================================
   */
  {
    title: "Vehicles",
    path: "/vehicles",
    icon: Truck,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
  },

  /**
   * ==========================================================
   * DRIVERS
   * ==========================================================
   */
  {
    title: "Drivers",
    path: "/drivers",
    icon: Users,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
  },

  /**
   * ==========================================================
   * DOCUMENTS
   * ==========================================================
   */
  {
    title: "Documents",
    path: "/documents",
    icon: FileText,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER, UserRole.STAFF],
  },

  /**
   * ==========================================================
   * COMPLIANCE
   * ==========================================================
   *
   * Document compliance monitoring.
   *
   * Existing page:
   * DocumentCompliancePage
   *
   * Existing route:
   * /documents/compliance
   */
  {
    title: "Compliance",
    path: "/documents/compliance",
    icon: ShieldCheck,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER, UserRole.STAFF],
  },

  /**
   * ==========================================================
   * EXPIRY
   * ==========================================================
   *
   * Phase 7 — Expiry Detection Engine
   */
  {
    title: "Expiry",
    path: "/expiry",
    icon: CalendarClock,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER, UserRole.STAFF],
  },

  /**
   * ==========================================================
   * AI OCR
   * ==========================================================
   */
  {
    title: "AI OCR",
    path: "/ocr",
    icon: ScanSearch,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
  },

  /**
   * ==========================================================
   * REMINDERS
   * ==========================================================
   */
  {
    title: "Reminders",
    path: "/reminders",
    icon: BellRing,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
  },

  /**
   * ==========================================================
   * REPORTS
   * ==========================================================
   */
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    roles: [UserRole.COMPANY_ADMIN, UserRole.FLEET_MANAGER],
  },

  /**
   * ==========================================================
   * SETTINGS
   * ==========================================================
   */
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    roles: [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN],
  },
];
