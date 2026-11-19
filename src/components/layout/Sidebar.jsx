
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  Users,
  Settings,
  LogOut,
  X,
  Kanban,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isManager = user?.role === "MANAGER";

  const navigation = [
    {
      name: "Dashboard",
      path: isManager
        ? "/manager/dashboard"
        : "/developer/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: isManager ? "Projects" : "My Projects",
      path: isManager ? "/manager/projects" : "/developer/projects",
      icon: FolderKanban,
    },
    {
      name: isManager ? "Issues" : "My Issues",
      path: isManager ? "/manager/issues" : "/developer/issues",
      icon: Bug,
    },
    {
      name: isManager ? "Kanban Board" : "Kanban Board",
      path: isManager ? "/manager/kanban" : "/developer/kanban",
      icon: Kanban,
    },
    {
      name: isManager ? "Team" : "My Team",
      path: isManager ? "/manager/team" : "/developer/team",
      icon: Users,
    },
    {
      name: "Settings",
      path: isManager ? "/manager/settings" : "/developer/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64
        flex-col bg-slate-950 text-white
        transition-transform duration-300 lg:sticky
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2">
              <Bug size={23} />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Bug Tracker
            </span>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* Workspace */}
        <div className="px-5 pb-3 pt-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3
                  text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.fullName || "User"}
              </p>

              <p className="text-xs text-slate-400">
                {user?.role || "Member"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
