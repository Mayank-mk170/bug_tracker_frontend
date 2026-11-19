
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.endsWith("/dashboard")) return "Dashboard";
    if (path.endsWith("/projects")) return "Projects";
    if (path.endsWith("/issues")) return "Issues";
    if (path.endsWith("/team")) return "Team";
    if (path.endsWith("/settings")) return "Settings";

    return "Workspace";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <Topbar
          setOpen={setSidebarOpen}
          title={getPageTitle()}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
