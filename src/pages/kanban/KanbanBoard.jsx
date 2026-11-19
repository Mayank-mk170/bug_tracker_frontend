
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Bug,
  AlertCircle,
  Circle,
  Clock,
  CheckCircle,
  GripVertical,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyProjects } from "../../services/projectService";
import {
  getAllProjectIssues,
  updateIssueStatus,
} from "../../services/issueService";

const columns = [
  {
    id: "TODO",
    title: "To Do",
    icon: Circle,
    color: "text-slate-600",
    border: "border-t-slate-400",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    icon: Clock,
    color: "text-blue-600",
    border: "border-t-blue-500",
  },
  {
    id: "DONE",
    title: "Done",
    icon: CheckCircle,
    color: "text-green-600",
    border: "border-t-green-500",
  },
];

const priorityStyles = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

function KanbanBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draggedIssueId, setDraggedIssueId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const isDeveloper = user?.role === "DEVELOPER";

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const projects = await getMyProjects();

      const issueResults = await getAllProjectIssues(projects);

      const projectMap = new Map(
        projects.map((project) => [project.id, project])
      );

      const issuesWithProject = issueResults.map((issue) => ({
        ...issue,
        projectName:
          projectMap.get(issue.projectId)?.name || "Unknown Project",
      }));

      const visibleIssues = isDeveloper
        ? issuesWithProject.filter(
            (issue) =>
              issue.assigneeEmail?.toLowerCase() ===
              user?.email?.toLowerCase()
          )
        : issuesWithProject;

      setIssues(visibleIssues);
    } catch (err) {
      console.error("Failed to load Kanban board:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load Kanban board. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [isDeveloper, user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchBoard();
    }
  }, [user?.email, fetchBoard]);

  const handleDragStart = (event, issueId) => {
    setDraggedIssueId(issueId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", issueId);
  };

  const handleDrop = async (event, newStatus) => {
    event.preventDefault();

    const issueId =
      draggedIssueId || event.dataTransfer.getData("text/plain");

    setDraggedIssueId(null);

    if (!issueId) return;

    const issue = issues.find((item) => item.id === issueId);

    if (!issue || issue.status === newStatus) return;

    const previousStatus = issue.status;

    try {
      setUpdatingId(issueId);

      await updateIssueStatus(issueId, newStatus);

      setIssues((previousIssues) =>
        previousIssues.map((item) =>
          item.id === issueId
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update issue status:", err);

      setError(
        err.response?.data?.message ||
          "Unable to move issue. Please try again."
      );

      // Keep the original status if the API update fails.
      setIssues((previousIssues) =>
        previousIssues.map((item) =>
          item.id === issueId
            ? { ...item, status: previousStatus }
            : item
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const openIssue = (issueId) => {
    const basePath = isDeveloper ? "/developer/issues" : "/manager/issues";
    navigate(`${basePath}/${issueId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-indigo-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading Kanban board...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isDeveloper ? "My Kanban Board" : "Kanban Board"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Drag and drop issues to update their status.
          </p>
        </div>

        <button
          onClick={fetchBoard}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          const count = issues.filter(
            (issue) => issue.status === column.id
          ).length;

          return (
            <div
              key={column.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${column.color}`}>
                  <Icon size={19} />
                  <span className="text-sm font-semibold">
                    {column.title}
                  </span>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;

          const columnIssues = issues.filter(
            (issue) => issue.status === column.id
          );

          return (
            <section
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, column.id)}
              className={`min-h-[450px] rounded-xl border border-slate-200 border-t-4 ${column.border} bg-slate-50 p-4`}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex items-center gap-2 ${column.color}`}>
                  <Icon size={19} />
                  <h2 className="font-semibold text-slate-800">
                    {column.title}
                  </h2>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                  {columnIssues.length}
                </span>
              </div>

              {/* Issue Cards */}
              <div className="space-y-3">
                {columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    draggable={updatingId !== issue.id}
                    onDragStart={(event) =>
                      handleDragStart(event, issue.id)
                    }
                    onDragEnd={() => setDraggedIssueId(null)}
                    onClick={() => openIssue(issue.id)}
                    className={`cursor-grab rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md active:cursor-grabbing ${
                      updatingId === issue.id
                        ? "opacity-50"
                        : ""
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-indigo-600">
                        {issue.projectKey || "ISSUE"}
                      </span>

                      <GripVertical
                        size={17}
                        className="shrink-0 text-slate-400"
                      />
                    </div>

                    <h3 className="font-semibold text-slate-800">
                      {issue.title}
                    </h3>

                    {issue.description && (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {issue.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          priorityStyles[issue.priority] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {issue.priority}
                      </span>

                      {issue.assigneeEmail && (
                        <span
                          className="max-w-[140px] truncate text-xs text-slate-500"
                          title={issue.assigneeEmail}
                        >
                          {issue.assigneeEmail}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="truncate text-xs text-slate-400">
                        {issue.projectName}
                      </p>
                    </div>

                    {updatingId === issue.id && (
                      <p className="mt-2 text-xs font-medium text-indigo-600">
                        Updating status...
                      </p>
                    )}
                  </div>
                ))}

                {columnIssues.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 px-4 py-10 text-center">
                    <Bug
                      size={25}
                      className="mx-auto text-slate-300"
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      No issues in this column
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Drag an issue here
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Tip: Drag an issue card into another column to change its status.
        Click a card to view its details.
      </p>
    </div>
  );
}

export default KanbanBoard;
