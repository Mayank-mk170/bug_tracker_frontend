
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  RefreshCw,
  X,
  CalendarDays,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getMyProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/projectService";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectKey: "",
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Projects loading error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      description: "",
      projectKey: "",
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      projectKey: project.projectKey || "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProject(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "projectKey" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingProject) {
        await updateProject(editingProject.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          projectKey: editingProject.projectKey,
        });
      } else {
        await createProject({
          name: formData.name.trim(),
          description: formData.description.trim(),
          projectKey: formData.projectKey.trim().toUpperCase(),
        });
      }

      setShowModal(false);
      setEditingProject(null);

      setFormData({
        name: "",
        description: "",
        projectKey: "",
      });

      await fetchProjects();
    } catch (err) {
      console.error("Project save error:", err);

      setError(
        err.response?.data?.message ||
          `Unable to ${editingProject ? "update" : "create"} project.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"? This will also delete its issues, comments and memberships. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(project.id);
      setError("");

      await deleteProject(project.id);
      await fetchProjects();
    } catch (err) {
      console.error("Project deletion error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete project. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const keyword = search.toLowerCase();

    return (
      project.name?.toLowerCase().includes(keyword) ||
      project.projectKey?.toLowerCase().includes(keyword) ||
      project.description?.toLowerCase().includes(keyword)
    );
  });

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and organize your team's projects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Project
        </button>
      </div>

      {/* Search and refresh */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          onClick={fetchProjects}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && !showModal && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Project count */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Total Projects</p>
        <h2 className="mt-1 text-3xl font-bold text-slate-800">
          {projects.length}
        </h2>
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <RefreshCw
            size={26}
            className="animate-spin text-blue-600"
          />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
          <FolderKanban
            size={40}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 font-semibold text-slate-800">
            {search ? "No matching projects" : "No projects found"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try another search term."
              : "Create your first project to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FolderKanban size={22} />
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                {project.name}
              </h3>

              <p className="mt-1 text-xs font-semibold tracking-wide text-blue-600">
                {project.projectKey}
              </p>

              <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">
                {project.description || "No description provided."}
              </p>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <CalendarDays size={15} />
                Created {formatDate(project.createdAt)}
              </div>

              {/* View Project Details */}
              <button
                onClick={() =>
                  navigate(`/manager/projects/${project.id}`)
                }
                className="mt-4 w-full rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                View Project Details
              </button>

              {/* Edit and Delete */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => openEditModal(project)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(project)}
                  disabled={deletingId === project.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  {deletingId === project.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit project modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingProject
                    ? "Update your project information."
                    : "Enter the details for your new project."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Project Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {!editingProject && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Project Key
                  </label>

                  <input
                    type="text"
                    name="projectKey"
                    value={formData.projectKey}
                    onChange={handleChange}
                    placeholder="e.g. BUGTRACK"
                    required
                    maxLength={10}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Use a unique short key for your project.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                      ? "Save Changes"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
