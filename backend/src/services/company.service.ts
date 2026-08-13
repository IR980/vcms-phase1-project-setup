import mongoose from "mongoose";

import { Company } from "../models/Company.model";

import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyQueryDto,
} from "../types/company.dto";

import { ApiError } from "../utils/ApiError";

class CompanyService {
  /**
   * Create Company
   */
  async createCompany(payload: CreateCompanyDto, userId: string) {
    const emailExists = await Company.exists({
      email: payload.email,
    });

    if (emailExists) {
      throw new ApiError(409, "Company email already exists");
    }

    if (payload.gstNumber) {
      const gstExists = await Company.exists({
        gstNumber: payload.gstNumber,
      });

      if (gstExists) {
        throw new ApiError(409, "GST number already exists");
      }
    }

    const company = await Company.create({
      ...payload,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return company;
  }

  /**
   * Get Companies
   */
  async getCompanies(query: CompanyQueryDto) {
    const { page, limit, search, status, sortBy, sortOrder } = query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        {
          companyName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          legalName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const total = await Company.countDocuments(filter);

    const companies = await Company.find(filter)
      .sort({
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      companies,

      pagination: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get Company
   */
  async getCompanyById(id: string) {
    const company = await Company.findById(id);

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    return company;
  }

  /**
   * Update Company
   */
  async updateCompany(id: string, payload: UpdateCompanyDto, userId: string) {
    const company = await Company.findById(id);

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    if (payload.email && payload.email !== company.email) {
      const emailExists = await Company.exists({
        email: payload.email,
        _id: { $ne: id },
      });

      if (emailExists) {
        throw new ApiError(409, "Email already exists");
      }
    }

    if (payload.gstNumber && payload.gstNumber !== company.gstNumber) {
      const gstExists = await Company.exists({
        gstNumber: payload.gstNumber,
        _id: { $ne: id },
      });

      if (gstExists) {
        throw new ApiError(409, "GST already exists");
      }
    }

    Object.assign(company, payload);

    company.updatedBy = new mongoose.Types.ObjectId(userId);

    await company.save();

    return company;
  }

  /**
   * Soft Delete
   */
  async deleteCompany(id: string) {
    const company = await Company.findById(id);

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    company.isDeleted = true;

    await company.save();

    return {
      message: "Company deleted successfully",
    };
  }
}

export default new CompanyService();
