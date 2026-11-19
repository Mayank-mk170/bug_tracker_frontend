import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bug,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Circle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyProjects } from "../../services/projectService";
import {
  connectWebSocket,
  subscribeToProjectIssues,
  disconnectWebSocket,
} from "../../services/webSocketService";
import {
  filterIssues,
  searchIssues,
  updateIssueStatus,
} from "../../services/issueService";

const statusStyles = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const priorityStyles = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// Extract issues from paginated or normal API responses
function getPageContent(response) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.content || [];
}

// Fetch all pages returned by the backend search endpoint
async function getAllSearchResults(projectId, keyword) {
  const pageSize = 100;
  let page = 0;
  let results = [];
  let totalPages = 1;

  do {
    const response = await searchIssues(
      projectId,
      keyword,
      page,
      pageSize
    );

    results = results.concat(getPageContent(response));

    totalPages = response?.totalPages || 1;
    page += 1;
  } while (page < totalPages);

  return results;
}

function DeveloperIssues() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch developer's assigned issues
  const fetchIssues = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      setError("");

      const projectData = await getMyProjects();
      setProjects(projectData);

      const keyword = search.trim();

      const issueRequests = projectData.map(async (project) => {
        let projectIssues;

        if (keyword) {
          // Backend search
          projectIssues = await getAllSearchResults(
            project.id,
            keyword
          );

          // Only show issues assigned to the logged-in developer
          projectIssues = projectIssues.filter(
            (issue) =>
              issue.assigneeEmail?.toLowerCase() ===
              user.email.toLowerCase()
          );

          // Apply status filter
          if (statusFilter !== "ALL") {
            projectIssues = projectIssues.filter(
              (issue) => issue.status === statusFilter
            );
          }

          // Apply priority filter
          if (priorityFilter !== "ALL") {
            projectIssues = projectIssues.filter(
              (issue) => issue.priority === priorityFilter
            );
          }
        } else {
          // Backend filtering
          projectIssues = await filterIssues(project.id, {
            status:
              statusFilter === "ALL"
                ? undefined
                : statusFilter,
            priority:
              priorityFilter === "ALL"
                ? undefined
                : priorityFilter,
            assigneeEmail: user.email,
          });
        }

        return projectIssues.map((issue) => ({
          ...issue,
          projectName: project.name,
        }));
      });

      const projectIssueResults = await Promise.all(issueRequests);

      setIssues(projectIssueResults.flat());
      setPage(0);
    } catch (err) {
      console.error("Failed to load developer issues:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your issues. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Keep the latest fetchIssues function available to WebSocket callbacks.
  const fetchIssuesRef = useRef(fetchIssues);

  useEffect(() => {
    fetchIssuesRef.current = fetchIssues;
  });

  // Subscribe to real-time updates for all projects the developer belongs to.
  useEffect(() => {
    let isActive = true;
    let subscriptions = [];

    const startWebSocket = async () => {
      try {
        const projectData = await getMyProjects();

        if (!isActive) return;

        connectWebSocket(
          () => {
            if (!isActive) return;

            subscriptions = projectData
              .map((project) =>
                subscribeToProjectIssues(project.id, (event) => {
                  console.log(
                    "Developer received issue event:",
                    event
                  );

                  fetchIssuesRef.current();
                })
              )
              .filter(Boolean);
          },
          (socketError) => {
            console.error(
              "Developer WebSocket error:",
              socketError
            );
          }
        );
      } catch (socketSetupError) {
        console.error(
          "Unable to initialize developer issue WebSocket:",
          socketSetupError
        );
      }
    };

    if (user?.email) {
      startWebSocket();
    }

    return () => {
      isActive = false;

      subscriptions.forEach((subscription) =>
        subscription.unsubscribe()
      );

      disconnectWebSocket();
    };
  }, [user?.email]);

  // Fetch when search or filters change
  useEffect(() => {
    if (!user?.email) return undefined;

    const timeoutId = setTimeout(() => {
      fetchIssues();
    }, 300);

    return () => clearTimeout(timeoutId);

    // fetchIssues intentionally uses current search and filter state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, search, statusFilter, priorityFilter]);

  // Update issue status
  const handleStatusChange = async (issueId, newStatus) => {
    try {
      setUpdatingId(issueId);
      setError("");

      await updateIssueStatus(issueId, newStatus);

      setIssues((previousIssues) =>
        previousIssues.map((issue) =>
          issue.id === issueId
            ? { ...issue, status: newStatus }
            : issue
        )
      );
    } catch (err) {
      console.error("Failed to update issue status:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update issue status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Dashboard statistics
  const counts = {
    total: issues.length,

    todo: issues.filter(
      (issue) => issue.status === "TODO"
    ).length,

    inProgress: issues.filter(
      (issue) => issue.status === "IN_PROGRESS"
    ).length,

    done: issues.filter(
      (issue) => issue.status === "DONE"
    ).length,
  };

  // Client-side pagination of the filtered results
  const totalPages = Math.max(
    1,
    Math.ceil(issues.length / pageSize)
  );

  const paginatedIssues = useMemo(() => {
    const startIndex = page * pageSize;

    return issues.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [issues, page, pageSize]);

  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Issues
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage issues assigned to you.
          </p>
        </div>

        <button
          onClick={fetchIssues}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            title: "Total Issues",
            value: counts.total,
            icon: Bug,
            color: "bg-purple-100 text-purple-600",
          },
          {
            title: "To Do",
            value: counts.todo,
            icon: Circle,
            color: "bg-slate-100 text-slate-600",
          },
          {
            title: "In Progress",
            value: counts.inProgress,
            icon: Clock,
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Completed",
            value: counts.done,
            icon: CheckCircle,
            color: "bg-green-100 text-green-600",
          },
        ].map(({ title, value, icon: Icon, color }) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`inline-flex rounded-lg p-3 ${color}`}>
              <Icon size={23} />
            </div>

            <p className="mt-5 text-sm text-slate-500">
              {title}
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {value}
            </h2>
          </div>
        ))}

      </div>

      {/* Assigned Issues */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Assigned Issues
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Issues assigned to{" "}
            {user?.fullName || user?.email || "you"}.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Search */}
          <div className="relative md:col-span-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues or project keys..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Issues Table */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading your issues...
          </div>
        ) : paginatedIssues.length === 0 ? (
          <div className="py-12 text-center">
            <Bug
              className="mx-auto text-slate-300"
              size={40}
            />

            <h3 className="mt-3 font-semibold text-slate-800">
              No issues found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No assigned issues match your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">

              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="pb-4 pr-4">Issue</th>
                  <th className="pb-4 pr-4">Project</th>
                  <th className="pb-4 pr-4">Priority</th>
                  <th className="pb-4 pr-4">Status</th>
                  <th className="pb-4 pr-4">Update Status</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-b border-slate-100 last:border-0"
                  >

                    {/* Issue */}
                    <td className="py-5 pr-4">
                      <p className="font-semibold text-slate-800">
                        {issue.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {issue.description}
                      </p>
                    </td>

                    {/* Project */}
                    <td className="py-5 pr-4">
                      <p className="font-medium text-slate-700">
                        {issue.projectName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {issue.projectKey}
                      </p>
                    </td>

                    {/* Priority */}
                    <td className="py-5 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          priorityStyles[issue.priority] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-5 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[issue.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {issue.status?.replace("_", " ")}
                      </span>
                    </td>

                    {/* Update Status */}
                    <td className="py-5 pr-4">
                      <select
                        value={issue.status}
                        disabled={updatingId === issue.id}
                        onChange={(e) =>
                          handleStatusChange(
                            issue.id,
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">
                          In Progress
                        </option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>

                    {/* View Issue Details */}
                    <td className="py-5">
                      <button
                        onClick={() =>
                          navigate(`/developer/issues/${issue.id}`)
                        }
                        title="View issue details"
                        aria-label={`View details for ${issue.title}`}
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Eye size={17} />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-xs text-slate-400">
              Showing{" "}
              {issues.length === 0 ? 0 : page * pageSize + 1}
              –
              {Math.min(
                (page + 1) * pageSize,
                issues.length
              )}{" "}
              of {issues.length} assigned issues
            </p>

            <div className="flex flex-wrap items-center gap-3">

              {/* Page Size */}
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Rows per page

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              {/* Previous */}
              <button
                onClick={() =>
                  setPage((current) => Math.max(0, current - 1))
                }
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              {/* Current Page */}
              <span className="text-xs text-slate-500">
                Page {page + 1} of {totalPages}
              </span>

              {/* Next */}
              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages - 1, current + 1)
                  )
                }
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

            </div>
          </div>
        )}

      </section>
    </div>
  );
}

export default DeveloperIssues;