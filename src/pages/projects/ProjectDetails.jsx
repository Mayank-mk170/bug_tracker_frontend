
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  Users,
  Bug,
  Clock,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getProjectById } from "../../services/projectService";
import { getIssuesByProject } from "../../services/issueService";
import { getProjectMembers } from "../../services/projectMemberService";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardBase =
    user?.role === "MANAGER" ? "/manager" : "/developer";

  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectData, issueData, memberData] = await Promise.all([
        getProjectById(projectId),
        getIssuesByProject(projectId),
        getProjectMembers(projectId),
      ]);

      setProject(projectData);
      setIssues(Array.isArray(issueData) ? issueData : []);
      setMembers(Array.isArray(memberData) ? memberData : []);
    } catch (err) {
      console.error("Project details loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load project details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [projectId]);

  const todoCount = issues.filter(
    (issue) => issue.status === "TODO"
  ).length;

  const progressCount = issues.filter(
    (issue) => issue.status === "IN_PROGRESS"
  ).length;

  const doneCount = issues.filter(
    (issue) => issue.status === "DONE"
  ).length;

  const getStatusStyle = (status) => {
    const styles = {
      TODO: "bg-slate-100 text-slate-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      DONE: "bg-green-100 text-green-700",
    };

    return styles[status] || "bg-slate-100 text-slate-600";
  };

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: "bg-green-100 text-green-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-red-100 text-red-700",
      CRITICAL: "bg-purple-100 text-purple-700",
    };

    return styles[priority] || "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <RefreshCw
          className="animate-spin text-indigo-600"
          size={28}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle size={19} />
          <p>{error}</p>
        </div>

        <button
          onClick={fetchDetails}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(`${dashboardBase}/projects`)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft size={17} />
        Back to Projects
      </button>

      {/* Project information */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <FolderKanban size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {project.name}
              </h1>

              <p className="mt-1 text-sm font-semibold text-indigo-600">
                {project.projectKey}
              </p>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                {project.description ||
                  "No project description provided."}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Active
          </span>
        </div>
      </section>

      {/* Project statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Issues",
            value: issues.length,
            icon: Bug,
            color: "text-purple-600 bg-purple-100",
          },
          {
            label: "To Do",
            value: todoCount,
            icon: Clock,
            color: "text-slate-600 bg-slate-100",
          },
          {
            label: "In Progress",
            value: progressCount,
            icon: RefreshCw,
            color: "text-blue-600 bg-blue-100",
          },
          {
            label: "Completed",
            value: doneCount,
            icon: CheckCircle,
            color: "text-green-600 bg-green-100",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`mb-4 inline-flex rounded-lg p-3 ${color}`}>
              <Icon size={21} />
            </div>

            <p className="text-sm text-slate-500">{label}</p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Issues and members */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Project Issues */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Project Issues
            </h2>

            <span className="text-sm text-slate-500">
              {issues.length} issues
            </span>
          </div>

          {issues.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No issues found in this project.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-400">
                    <th className="pb-3 pr-4">Issue</th>
                    <th className="pb-3 pr-4">Assignee</th>
                    <th className="pb-3 pr-4">Priority</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {issues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium text-slate-800">
                          {issue.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {project.projectKey}
                        </p>
                      </td>

                      <td className="py-4 pr-4 text-slate-600">
                        {issue.assigneeEmail || "Unassigned"}
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(
                            issue.priority
                          )}`}
                        >
                          {issue.priority}
                        </span>
                      </td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
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

        {/* Project Members */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Project Members
            </h2>

            <Users size={19} className="text-slate-400" />
          </div>

          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No project members found.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id || member.userId}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {member.email}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {member.projectRole}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {member.projectRole}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
