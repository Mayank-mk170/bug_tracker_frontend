
import {
  User,
  Mail,
  ShieldCheck,
  Settings as SettingsIcon,
  LockKeyhole,
  CalendarDays,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Settings() {
  const { user } = useAuth();

  const accountDetails = [
    {
      label: "Full Name",
      value: user?.fullName || "Not available",
      icon: User,
    },
    {
      label: "Email Address",
      value: user?.email || "Not available",
      icon: Mail,
    },
    {
      label: "Account Role",
      value: user?.role || "Not available",
      icon: ShieldCheck,
    },
    {
      label: "Account Status",
      value: "Active",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Profile Overview */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
            {user?.fullName?.charAt(0)?.toUpperCase() || "M"}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {user?.fullName || "Manager"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {user?.email}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {user?.role || "MANAGER"}
            </span>
          </div>
        </div>
      </section>

      {/* Account Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
            <User size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">
              Account Information
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your registered account details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {accountDetails.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">
                <Icon size={19} className="text-slate-500" />
                <span className="text-sm text-slate-500">
                  {label}
                </span>
              </div>

              <p className="mt-3 break-all font-semibold text-slate-800">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Information */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-3 text-green-600">
            <LockKeyhole size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Security
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your account is protected by password-based authentication.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-green-600" size={20} />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Authentication Enabled
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Your account uses secure JWT authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <SettingsIcon size={15} />
        Bug Tracker Account Settings
      </div>
    </div>
  );
}

export default Settings;
