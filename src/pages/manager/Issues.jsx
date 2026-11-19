
import { useEffect, useState } from "react";
import {
  Bug,
  Search,
  RefreshCw,
  Plus,
  X,
  AlertCircle,
  CalendarDays,
  Filter,
  Pencil,
  Trash2,
  UserPlus,
  Save,
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  connectWebSocket,
  subscribeToProjectIssues,
  disconnectWebSocket,
} from "../../services/webSocketService";

import { getProjectMembers } from "../../services/projectMemberService";
import { getMyProjects } from "../../services/projectService";

import {
  getAllProjectIssues,
  createIssue,
  updateIssue,
  assignIssue,
  updateIssueStatus,
  deleteIssue,
  filterIssues,
  searchIssues,
  getIssuesPaginated,
} from "../../services/issueService";

const initialForm = {
  title: "",
  description: "",
  projectId: "",
  priority: "MEDIUM",
};

const initialEditForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
};

export default function Issues() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [issues, setIssues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [queryIssues, setQueryIssues] = useState(null);
  const [serverPageInfo, setServerPageInfo] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [assigningIssue, setAssigningIssue] = useState(null);

  const [formData, setFormData] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialEditForm);

  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [projectDevelopers, setProjectDevelopers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Fetch projects and issues
  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const projectData = await getMyProjects();
      setProjects(projectData);

      const issueData = await getAllProjectIssues(projectData);
      setIssues(issueData);
    } catch (err) {
      console.error("Issues loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load issues. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // WebSocket connection and project subscriptions
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
                    "Manager received issue event:",
                    event
                  );

                  fetchIssues();
                })
              )
              .filter(Boolean);
          },
          (socketError) => {
            console.error(
              "Manager WebSocket error:",
              socketError
            );
          }
        );
      } catch (socketSetupError) {
        console.error(
          "Unable to initialize project WebSocket:",
          socketSetupError
        );
      }
    };

    startWebSocket();

    return () => {
      isActive = false;

      subscriptions.forEach((subscription) =>
        subscription.unsubscribe()
      );

      disconnectWebSocket();
    };
  }, []);

  // Search, filter and pagination API
  useEffect(() => {
    let cancelled = false;

    const loadQueryResults = async () => {
      if (projectFilter === "ALL") {
        setQueryIssues(null);
        setServerPageInfo(null);
        return;
      }

      try {
        setQueryLoading(true);
        setError("");

        let response;

        if (search.trim()) {
          response = await searchIssues(
            projectFilter,
            search.trim(),
            page,
            pageSize
          );

          if (cancelled) return;

          setQueryIssues(response.content || []);

          setServerPageInfo({
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0,
            serverPaginated: true,
          });
        } else if (
          statusFilter !== "ALL" ||
          priorityFilter !== "ALL" ||
          assigneeFilter.trim()
        ) {
          response = await filterIssues(projectFilter, {
            status: statusFilter === "ALL" ? "" : statusFilter,
            priority:
              priorityFilter === "ALL" ? "" : priorityFilter,
            assigneeEmail: assigneeFilter.trim(),
          });

          if (cancelled) return;

          setQueryIssues(
            Array.isArray(response) ? response : []
          );

          setServerPageInfo(null);
        } else {
          response = await getIssuesPaginated(
            projectFilter,
            page,
            pageSize,
            "createdAt",
            "DESC"
          );

          if (cancelled) return;

          setQueryIssues(response.content || []);

          setServerPageInfo({
            totalPages: response.totalPages || 0,
            totalElements: response.totalElements || 0,
            serverPaginated: true,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Issue query error:", err);

          setError(
            err.response?.data?.message ||
              "Unable to search or filter issues. Please try again."
          );

          setQueryIssues([]);
          setServerPageInfo(null);
        }
      } finally {
        if (!cancelled) {
          setQueryLoading(false);
        }
      }
    };

    loadQueryResults();

    return () => {
      cancelled = true;
    };
  }, [
    projectFilter,
    search,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    page,
    pageSize,
    issues,
  ]);

  // Handle create form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create issue
  const handleCreateIssue = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createIssue({
        title: formData.title.trim(),
        description: formData.description.trim(),
        projectId: formData.projectId,
        priority: formData.priority,
      });

      setShowModal(false);
      setFormData(initialForm);

      await fetchIssues();
    } catch (err) {
      console.error("Issue creation error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create issue. Please check the required fields."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal
  const openEditModal = (issue) => {
    setEditingIssue(issue);

    setEditForm({
      title: issue.title || "",
      description: issue.description || "",
      priority: issue.priority || "MEDIUM",
    });

    setError("");
  };

  // Update issue
  const handleUpdateIssue = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setError("");

      await updateIssue(editingIssue.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
      });

      setEditingIssue(null);
      await fetchIssues();
    } catch (err) {
      console.error("Issue update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update issue."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Open assignment modal
  const openAssignModal = async (issue) => {
    setAssigningIssue(issue);
    setAssigneeEmail(issue.assigneeEmail || "");
    setProjectDevelopers([]);
    setError("");

    try {
      setMembersLoading(true);

      const members = await getProjectMembers(issue.projectId);

      const developers = members.filter(
        (member) => member.projectRole === "DEVELOPER"
      );

      setProjectDevelopers(developers);
    } catch (err) {
      console.error("Project members loading error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load project developers."
      );
    } finally {
      setMembersLoading(false);
    }
  };

  // Assign issue
  const handleAssignIssue = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setError("");

      await assignIssue(
        assigningIssue.id,
        assigneeEmail.trim()
      );

      setAssigningIssue(null);
      setAssigneeEmail("");

      await fetchIssues();
    } catch (err) {
      console.error("Issue assignment error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to assign issue. Check the developer email."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Update issue status
  const handleStatusChange = async (issueId, status) => {
    try {
      setActionLoading(true);
      setError("");

      await updateIssueStatus(issueId, status);
      await fetchIssues();
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update issue status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete issue
  const handleDeleteIssue = async (issue) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${issue.title}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await deleteIssue(issue.id);
      await fetchIssues();
    } catch (err) {
      console.error("Issue deletion error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete issue."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Local filtering when all projects are selected
  const locallyFilteredIssues = issues.filter((issue) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      issue.title?.toLowerCase().includes(keyword) ||
      issue.description?.toLowerCase().includes(keyword) ||
      issue.projectKey?.toLowerCase().includes(keyword) ||
      issue.assigneeEmail?.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "ALL" ||
      issue.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" ||
      issue.priority === priorityFilter;

    const matchesProject =
      projectFilter === "ALL" ||
      issue.projectId === projectFilter;

    const matchesAssignee =
      !assigneeFilter.trim() ||
      issue.assigneeEmail?.toLowerCase().includes(
        assigneeFilter.trim().toLowerCase()
      );

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesProject &&
      matchesAssignee
    );
  });

  const useServerResults = projectFilter !== "ALL";

  const sourceIssues =
    useServerResults && queryIssues !== null
      ? queryIssues
      : locallyFilteredIssues;

  const isServerPaged = Boolean(
    serverPageInfo?.serverPaginated
  );

  const totalIssueCount = useServerResults
    ? serverPageInfo?.totalElements ?? sourceIssues.length
    : locallyFilteredIssues.length;

  const totalPages =
    useServerResults && isServerPaged
      ? serverPageInfo?.totalPages ?? 0
      : Math.ceil(sourceIssues.length / pageSize);

  const visibleIssues =
    useServerResults && isServerPaged
      ? sourceIssues
      : sourceIssues.slice(
          page * pageSize,
          (page + 1) * pageSize
        );

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle = {
    TODO: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DONE: "bg-green-100 text-green-700",
  };

  const priorityStyle = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    CRITICAL: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Issues
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track, organize, and manage project issues.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");

            setFormData({
              ...initialForm,
              projectId: projects[0]?.id || "",
            });

            setShowModal(true);
          }}
          disabled={projects.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Create Issue
        </button>
      </div>

      {/* Error */}
      {error &&
        !showModal &&
        !editingIssue &&
        !assigningIssue && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={handleFilterChange(setSearch)}
            placeholder="Search by issue, description, project or assignee..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={projectFilter}
            onChange={handleFilterChange(setProjectFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">All Projects</option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.projectKey})
              </option>
            ))}
          </select>

          <input
            type="text"
            value={assigneeFilter}
            onChange={handleFilterChange(setAssigneeFilter)}
            placeholder="Filter assignee email"
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={handleFilterChange(setPriorityFilter)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <button
            onClick={fetchIssues}
            disabled={loading || actionLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Issue count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">
            All Issues
          </h2>

          <p className="text-sm text-slate-500">
            Showing {visibleIssues.length} of {totalIssueCount} issues
          </p>
        </div>

        <Filter size={19} className="text-slate-400" />
      </div>

      {/* Issue list */}
      {loading || queryLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <RefreshCw
            size={27}
            className="animate-spin text-blue-600"
          />
        </div>
      ) : visibleIssues.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <Bug
            size={40}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 font-semibold text-slate-800">
            No issues found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your filters or create a new issue.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase text-slate-500">
                  <th className="px-5 py-4 font-medium">Issue</th>
                  <th className="px-5 py-4 font-medium">Project</th>
                  <th className="px-5 py-4 font-medium">Assignee</th>
                  <th className="px-5 py-4 font-medium">Priority</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                          <Bug size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {issue.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {issue.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-blue-600">
                      {issue.projectKey}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {issue.assigneeEmail || "Unassigned"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          priorityStyle[issue.priority] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={issue.status || "TODO"}
                        onChange={(e) =>
                          handleStatusChange(
                            issue.id,
                            e.target.value
                          )
                        }
                        disabled={actionLoading}
                        className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${
                          statusStyle[issue.status] ||
                          "bg-slate-100 text-slate-600"
                        } disabled:opacity-60`}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={14} />
                        {formatDate(issue.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/manager/issues/${issue.id}`)
                          }
                          title="View issue details"
                          className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => openEditModal(issue)}
                          title="Edit issue"
                          disabled={actionLoading}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => openAssignModal(issue)}
                          title="Assign developer"
                          disabled={actionLoading}
                          className="rounded-lg p-2 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
                        >
                          <UserPlus size={17} />
                        </button>

                        <button
                          onClick={() => handleDeleteIssue(issue)}
                          title="Delete issue"
                          disabled={actionLoading}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !queryLoading && totalIssueCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Rows per page</span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <span>
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.max(0, current - 1))
              }
              disabled={page === 0}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    Math.max(totalPages - 1, 0),
                    current + 1
                  )
                )
              }
              disabled={
                totalPages === 0 || page >= totalPages - 1
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create issue modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Create Issue
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new issue to your project.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleCreateIssue}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Issue Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={100}
                  placeholder="Enter issue title"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Project
                </label>

                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select Project</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.projectKey})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder="Describe the issue..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit issue modal */}
      {editingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Edit Issue
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update issue details.
                </p>
              </div>

              <button
                onClick={() => setEditingIssue(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleUpdateIssue}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Issue Title
                </label>

                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      title: e.target.value,
                    })
                  }
                  required
                  minLength={3}
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Priority
                </label>

                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      priority: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingIssue(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Save size={16} />
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign developer modal */}
      {assigningIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Assign Developer
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {assigningIssue.title}
                </p>
              </div>

              <button
                onClick={() => setAssigningIssue(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleAssignIssue}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Select Developer
                </label>

                <select
                  value={assigneeEmail}
                  onChange={(e) =>
                    setAssigneeEmail(e.target.value)
                  }
                  required
                  disabled={
                    membersLoading ||
                    projectDevelopers.length === 0
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                >
                  <option value="">
                    {membersLoading
                      ? "Loading developers..."
                      : projectDevelopers.length === 0
                        ? "No developers available"
                        : "Select a developer"}
                  </option>

                  {projectDevelopers.map((member) => (
                    <option
                      key={member.userId}
                      value={member.email}
                    >
                      {member.email}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-slate-500">
                  Only developers added to this project are displayed.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAssigningIssue(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading ||
                    membersLoading ||
                    !assigneeEmail.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <UserPlus size={16} />
                  {actionLoading
                    ? "Assigning..."
                    : "Assign Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
