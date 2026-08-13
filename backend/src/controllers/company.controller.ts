import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/request.types";
import companyService from "../services/company.service";

import { ApiResponse } from "../utils/ApiResponse";

import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyQueryDto,
} from "../types/company.dto";

/**
 * Create Company
 */
export const createCompany = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const company = await companyService.createCompany(
    req.body as CreateCompanyDto,
    req.user!.id,
  );

  res
    .status(201)
    .json(new ApiResponse(201, "Company created successfully", company));
};

/**
 * Get Companies
 */
export const getCompanies = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const result = await companyService.getCompanies(
    req.query as unknown as CompanyQueryDto,
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Companies fetched successfully", result));
};

/**
 * Get Company By Id
 */
export const getCompanyById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const company = await companyService.getCompanyById(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Company fetched successfully", company));
};

/**
 * Update Company
 */
export const updateCompany = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const company = await companyService.updateCompany(
    req.params.id,
    req.body as UpdateCompanyDto,
    req.user!.id,
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Company updated successfully", company));
};

/**
 * Delete Company
 */
export const deleteCompany = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const result = await companyService.deleteCompany(req.params.id);

  res.status(200).json(new ApiResponse(200, result.message, null));
};
