import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { UploadCloud, Image, Trash2 } from "lucide-react";

import type { CompanyFormValues } from "../../../validation/company.schema";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const LogoUpload = () => {
  const {
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<CompanyFormValues>();

  const inputRef = useRef<HTMLInputElement>(null);

  const logo = watch("logo");

  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!logo) {
      setPreview(null);
      return;
    }

    if (typeof logo === "string") {
      setPreview(logo);
      return;
    }

    if (logo instanceof File) {
      const url = URL.createObjectURL(logo);

      setPreview(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [logo]);

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("logo", {
        message: "Only JPG, PNG and WEBP images are allowed.",
      });

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("logo", {
        message: "Maximum file size is 2MB.",
      });

      return;
    }

    clearErrors("logo");

    setValue("logo", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeLogo = () => {
    setValue("logo", undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setPreview(null);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Company Logo</h2>

        <p className="mt-1 text-sm text-slate-500">Upload your company logo.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) {
            handleFile(file);
          }
        }}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 py-10 transition hover:border-blue-500 hover:bg-blue-50"
        >
          <UploadCloud size={40} className="text-blue-600" />

          <p className="mt-4 font-semibold">Click to upload logo</p>

          <p className="mt-1 text-sm text-slate-500">
            PNG, JPG or WEBP (Max 2MB)
          </p>
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 p-5">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
              <img
                src={preview}
                alt="Company Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Image size={18} className="text-green-600" />

                <span className="font-medium">Logo Selected</span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Your logo will appear on invoices, reports and dashboard.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                >
                  Change Logo
                </button>

                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errors.logo && (
        <p className="mt-4 text-sm text-red-600">
          {String(errors.logo.message)}
        </p>
      )}
    </section>
  );
};

export default LogoUpload;
