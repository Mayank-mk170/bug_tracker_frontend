
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Bug,
  Clock,
  CheckCircle,
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyProjects } from "../../services/projectService";
import { getIssuesByProject } from "../../services/issueService";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [projectIssues, setProjectIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const projectData = await getMyProjects();
      const projectList = Array.isArray(projectData) ? projectData : [];

      setProjects(projectList);

      const issueResults = await Promise.all(
        projectList.map(async (project) => {
          const response = await getIssuesByProject(project.id);
          return Array.isArray(response) ? response : [];
        })
      );

      const allIssues = issueResults.flat();

      // Show only issues assigned to the logged-in developer.
      const myIssues = allIssues.filter(
        (issue) =>
          issue.assigneeEmail?.toLowerCase() === user?.email?.toLowerCase()
      );

      setProjectIssues(myIssues);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const totalIssues = projectIssues.length;

  const todoIssues = projectIssues.filter(
    (issue) => issue.status === "TODO"
  ).length;

  const inProgressIssues = projectIssues.filter(
    (issue) => issue.status === "IN_PROGRESS"
  ).length;

  const completedIssues = projectIssues.filter(
    (issue) => issue.status === "DONE"
  ).length;

  const progress =
    totalIssues === 0
      ? 0
      : Math.round((completedIssues / totalIssues) * 100);

  const recentIssues = [...projectIssues]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "My Issues",
      value: totalIssues,
      icon: Bug,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "In Progress",
      value: inProgressIssues,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Completed",
      value: completedIssues,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
  ];

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: "bg-green-100 text-green-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-red-100 text-red-700",
      CRITICAL: "bg-purple-100 text-purple-700",
    };

    return styles[priority] || "bg-slate-100 text-slate-600";
  };

  const getStatusStyle = (status) => {
    const styles = {
      TODO: "bg-slate-100 text-slate-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      DONE: "bg-green-100 text-green-700",
    };

    return styles[status] || "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-indigo-600" size={30} />
          <p className="mt-3 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user?.fullName || "Developer"}! Here's your work overview.
          </p>
        </div>

        <button
          onClick={() => navigate("/developer/issues")}
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          View My Issues
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-3 ${color}`}>
                <Icon size={23} />
              </div>
              <ArrowUpRight size={18} className="text-slate-400" />
            </div>

            <p className="mt-5 text-sm text-slate-500">{title}</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {value.toString().padStart(2, "0")}
            </h2>
          </div>
        ))}
      </div>

      {/* Recent Issues and Project Overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Recent Issues
            </h2>
            <button
              onClick={() => navigate("/developer/issues")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View All
            </button>
          </div>

          {recentIssues.length === 0 ? (
            <div className="py-10 text-center">
              <Bug className="mx-auto text-slate-300" size={35} />
              <p className="mt-3 text-sm text-slate-500">
                No issues assigned to you yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-400">
                    <th className="pb-3">Issue</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-4 pr-3">
                        <p className="font-medium text-slate-800">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {issue.projectKey || "PROJECT"}
                        </p>
                      </td>

                      <td className="py-4 pr-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                            issue.priority
                          )}`}
                        >
                          {issue.priority}
                        </span>
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            issue.status
                          )}`}
                        >
                          {issue.status?.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Project Overview */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900">
            Project Overview
          </h2>

          <div className="mt-6 space-y-4">
            {projects.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                You are not a member of any project yet.
              </p>
            ) : (
              projects.map((project) => {
                const issues = projectIssues.filter(
                  (issue) => issue.projectId === project.id
                );

                const done = issues.filter(
                  (issue) => issue.status === "DONE"
                ).length;

                const projectProgress =
                  issues.length === 0
                    ? 0
                    : Math.round((done / issues.length) * 100);

                return (
                  <div
                    key={project.id}
                    className="rounded-lg bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                        <FolderKanban size={22} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-800">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {project.projectKey}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-between text-sm">
                      <span className="text-slate-500">
                        My issue progress
                      </span>
                      <span className="font-semibold text-slate-800">
                        {projectProgress}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${projectProgress}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {issues.length} assigned issue{issues.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Issue Status Overview */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 font-semibold text-slate-900">
          My Issue Status Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">To Do</p>
            <p className="mt-2 text-2xl font-bold text-slate-800">
              {todoIssues}
            </p>
          </div>

          <div className="rounded-lg bg-orange-50 p-4">
            <p className="text-sm text-orange-600">In Progress</p>
            <p className="mt-2 text-2xl font-bold text-orange-700">
              {inProgressIssues}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-600">Completed</p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {completedIssues}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
