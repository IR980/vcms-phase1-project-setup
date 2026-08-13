import { z } from "zod";

export const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),

  legalName: z.string().min(2, "Legal name is required"),

  ownerName: z.string().min(2, "Owner name is required"),

  email: z.string().email(),

  phone: z.string().min(10),

  gstNumber: z.string().optional(),

  panNumber: z.string().optional(),

  website: z.string().optional(),

  address: z.string().min(5),

  city: z.string().min(2),

  state: z.string().min(2),

  country: z.string(),

  postalCode: z.string().min(5),

  logo: z.any().optional(),
});

export type CompanyFormValues = z.infer<
  typeof companySchema
>;