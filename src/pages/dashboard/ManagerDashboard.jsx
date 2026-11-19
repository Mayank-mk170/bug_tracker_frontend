
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Bug,
  Clock3,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyProjects } from "../../services/projectService";
import { getAllProjectIssues } from "../../services/issueService";

export default function ManagerDashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);
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
      setProjects(projectData);

      const issueData = await getAllProjectIssues(projectData);
      setIssues(issueData);
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

  const totalProjects = projects.length;
  const totalIssues = issues.length;

  const todoIssues = issues.filter(
    (issue) => issue.status === "TODO"
  ).length;

  const inProgressIssues = issues.filter(
    (issue) => issue.status === "IN_PROGRESS"
  ).length;

  const completedIssues = issues.filter(
    (issue) => issue.status === "DONE"
  ).length;

  const completionRate =
    totalIssues > 0
      ? Math.round((completedIssues / totalIssues) * 100)
      : 0;

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      description: "Your active projects",
      icon: FolderKanban,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Issues",
      value: totalIssues,
      description: "Across all projects",
      icon: Bug,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "In Progress",
      value: inProgressIssues,
      description: "Currently being worked on",
      icon: Clock3,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Completed",
      value: completedIssues,
      description: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
  ];

  const statusData = [
    {
      label: "To Do",
      value: todoIssues,
      color: "bg-slate-400",
    },
    {
      label: "In Progress",
      value: inProgressIssues,
      color: "bg-blue-500",
    },
    {
      label: "Done",
      value: completedIssues,
      color: "bg-green-500",
    },
  ];

  const recentIssues = [...issues]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 5);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const firstName = user?.fullName?.split(" ")[0] || "Manager";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-blue-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
        <AlertCircle size={35} className="mx-auto text-red-500" />
        <h2 className="mt-3 font-semibold text-slate-800">
          Failed to load dashboard
        </h2>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your projects today.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {item.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={23} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Projects and issue status */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Projects */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">
                My Projects
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Projects assigned to your account
              </p>
            </div>
            <FolderKanban size={20} className="text-slate-400" />
          </div>

          {projects.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No projects found.
            </p>
          ) : (
            <div className="space-y-5">
              {projects.slice(0, 5).map((project) => {
                const projectIssues = issues.filter(
                  (issue) => issue.projectId === project.id
                );

                const completed = projectIssues.filter(
                  (issue) => issue.status === "DONE"
                ).length;

                const progress =
                  projectIssues.length > 0
                    ? Math.round(
                        (completed / projectIssues.length) * 100
                      )
                    : 0;

                return (
                  <div key={project.id}>
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <FolderKanban size={19} />
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            {project.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {project.projectKey} · {projectIssues.length} issues
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-500">
                        Created {formatDate(project.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <span className="text-xs font-semibold text-slate-600">
                        {progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Issue status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">
            Issue Status
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Current issue distribution
          </p>

          <div className="mt-6 space-y-5">
            {statusData.map((item) => {
              const percentage =
                totalIssues > 0
                  ? (item.value / totalIssues) * 100
                  : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.label}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {item.value}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle2 size={18} />
              <span className="text-sm font-semibold">
                {completionRate}% completed
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-blue-600">
              {completedIssues} out of {totalIssues} issues are completed.
            </p>
          </div>
        </div>
      </div>

      {/* Recent issues */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Recent Issues
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recently updated issues across your projects
            </p>
          </div>

          <MoreHorizontal size={20} className="text-slate-400" />
        </div>

        {recentIssues.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No issues found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <th className="pb-3 font-medium">Issue</th>
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Assignee</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {issue.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(issue.createdAt)}
                      </p>
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {issue.projectKey}
                    </td>

                    <td className="py-4 text-sm text-slate-600">
                      {issue.assigneeEmail || "Unassigned"}
                    </td>

                    <td className="py-4">
                      <span className="text-xs font-semibold text-slate-600">
                        {issue.priority}
                      </span>
                    </td>

                    <td className="py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {issue.status?.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
