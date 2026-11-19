
import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Topbar({ setOpen, title = "Dashboard" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">

      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Open sidebar"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className="text-xs text-slate-400 mb-1">
            Workspace / {user?.role || "Member"}
          </p>

          <h1 className="text-lg md:text-xl font-bold text-slate-800 truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 md:gap-5">

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2.5 rounded-xl w-56 lg:w-72">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything..."
            className="bg-transparent outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 md:gap-3 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800">
                {user?.fullName || "User"}
              </p>

              <p className="text-xs text-slate-400">
                {user?.role || "Member"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className="hidden sm:block text-slate-400"
            />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-14 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">

              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.fullName || "User"}
                </p>

                <p className="text-xs text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => setProfileOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <User size={17} />
                My Profile
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate(
                    user?.role === "MANAGER"
                      ? "/manager/settings"
                      : "/developer/settings"
                  );
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <Settings size={17} />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut size={17} />
                Sign Out
              </button>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
