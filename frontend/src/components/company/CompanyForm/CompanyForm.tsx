import { useEffect } from "react";

import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  companySchema,
  type CompanyFormValues,
} from "../../../validation/company.schema";

import type { Company } from "../../../types/company.types";

import { useCompanyStore } from "../../../store/company.store";

import BasicInfoSection from "./BasicInfoSection";
import ContactSection from "./ContactSection";
import BusinessSection from "./BusinessSection";
import AddressSection from "./AddressSection";
import LogoUpload from "./LogoUpload";
import CompanyFormActions from "./CompanyFormActions";

interface CompanyFormProps {
  mode: "create" | "edit";

  company?: Company;

  onSuccess?: () => void;
}

const CompanyForm = ({ mode, company, onSuccess }: CompanyFormProps) => {
  const { addCompany, editCompany, loading } = useCompanyStore();

  const methods = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),

    defaultValues: {
      companyName: "",

      legalName: "",

      ownerName: "",

      email: "",

      phone: "",

      gstNumber: "",

      panNumber: "",

      website: "",

      address: "",

      city: "",

      state: "",

      country: "India",

      postalCode: "",

      logo: "",
    },
  });

  /**
   * Edit Mode
   */
  useEffect(() => {
    if (!company) return;

    methods.reset({
      companyName: company.companyName,

      legalName: company.legalName,

      ownerName: company.ownerName,

      email: company.email,

      phone: company.phone,

      gstNumber: company.gstNumber ?? "",

      panNumber: company.panNumber ?? "",

      website: company.website ?? "",

      address: company.address,

      city: company.city,

      state: company.state,

      country: company.country,

      postalCode: company.postalCode,

      logo: company.logo ?? "",
    });
  }, [company, methods]);

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      if (mode === "create") {
        await addCompany(values);
      } else if (company) {
        await editCompany(company._id, values);
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoSection />

        <ContactSection />

        <BusinessSection />

        <AddressSection />

        <LogoUpload />

        <CompanyFormActions loading={loading} mode={mode} />
      </form>
    </FormProvider>
  );
};

export default CompanyForm;
