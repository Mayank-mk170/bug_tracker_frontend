
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import MainLayout from "./components/layout/MainLayout";
import RoleRoute from "./routes/RoleRoute";

import ManagerDashboard from "./pages/dashboard/ManagerDashboard";
import Dashboard from "./pages/dashboard/Dashboard";

import Projects from "./pages/manager/Projects";
import Issues from "./pages/manager/Issues";
import Team from "./pages/manager/Team";
import ManagerSettings from "./pages/manager/Settings";

import DeveloperIssues from "./pages/developer/DeveloperIssues";
import DeveloperProjects from "./pages/developer/DeveloperProjects";
import DeveloperTeam from "./pages/developer/DeveloperTeam";
import DeveloperSettings from "./pages/developer/Settings";
import ProjectDetails from "./pages/projects/ProjectDetails";

import IssueDetails from "./pages/issues/IssueDetails";

import KanbanBoard from "./pages/kanban/KanbanBoard";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Manager routes */}
          <Route element={<RoleRoute allowedRoles={["MANAGER"]} />}>
            <Route element={<MainLayout />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/projects" element={<Projects />} />
              <Route path="/manager/issues" element={<Issues />} />
              <Route path="/manager/team" element={<Team />} />
              <Route path="/manager/settings" element={<ManagerSettings />} />
              <Route path="/manager/projects/:projectId" element={<ProjectDetails />} />
              <Route
                path="/manager/issues/:issueId"
                element={<IssueDetails />}
              />
              <Route
                path="/manager/kanban"
                element={<KanbanBoard />}
              />
            </Route>
          </Route>

          {/* Developer routes */}
          <Route element={<RoleRoute allowedRoles={["DEVELOPER"]} />}>
            <Route element={<MainLayout />}>
              <Route path="/developer/dashboard" element={<Dashboard />} />
              <Route path="/developer/issues" element={<DeveloperIssues />} />
              <Route path="/developer/projects" element={<DeveloperProjects />} />
              <Route path="/developer/team" element={<DeveloperTeam />} />
              <Route path="/developer/settings" element={<DeveloperSettings />} />
              <Route path="/developer/projects/:projectId" element={<ProjectDetails />} />

              <Route
                path="/developer/issues/:issueId"
                element={<IssueDetails />}
              />
              <Route
                path="/developer/kanban"
                element={<KanbanBoard />}
              />
            </Route>
          </Route>

          {/* Unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
