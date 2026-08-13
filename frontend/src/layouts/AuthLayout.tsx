import { Outlet } from "react-router-dom";
import {
  ShieldCheck,
  BellRing,
  FileText,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI OCR Document Upload",
    description:
      "Automatically extract details from RC, Insurance, Fitness and PUC documents.",
  },
  {
    icon: BellRing,
    title: "Renewal Reminder",
    description:
      "Receive automatic reminders before document expiry.",
  },
  {
    icon: Truck,
    title: "Fleet Management",
    description:
      "Manage unlimited companies, vehicles and drivers from one platform.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    description:
      "JWT authentication, encrypted passwords and enterprise-grade security.",
  },
];

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Section */}
        <div className="hidden bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 p-16 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-lg">
                <Truck size={34} />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  VCMS
                </h1>

                <p className="text-blue-100">
                  Vehicle Compliance Management System
                </p>
              </div>
            </div>

            <h2 className="max-w-lg text-5xl font-bold leading-tight">
              Never Miss Your Vehicle Renewal Again
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Manage vehicle compliance, upload documents,
              track expiries, and receive smart reminders —
              all from one secure platform.
            </p>
          </div>

          <div className="grid gap-6">
            {features.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-xl bg-white/10 p-5 backdrop-blur-sm"
              >
                <div className="rounded-lg bg-white p-3 text-blue-700">
                  <item.icon size={22} />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-blue-100">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-center bg-slate-50 px-6 py-10">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;