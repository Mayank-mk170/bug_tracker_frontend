
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Search,
  RefreshCw,
  CalendarDays,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { getMyProjects } from "../../services/projectService";

function DeveloperProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load projects:", err);
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

  const filteredProjects = projects.filter((project) => {
    const keyword = search.toLowerCase();

    return (
      project.name?.toLowerCase().includes(keyword) ||
      project.projectKey?.toLowerCase().includes(keyword) ||
      project.description?.toLowerCase().includes(keyword)
    );
  });

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewDetails = (projectId) => {
    navigate(`/developer/projects/${projectId}`);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View the projects you are currently working on.
          </p>
        </div>

        <button
          onClick={fetchProjects}
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

      {/* Project Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-indigo-100 p-3 text-indigo-600">
            <FolderKanban size={23} />
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Total Projects
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "..." : projects.length}
          </h2>
        </div>
      </div>

      {/* Project List */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Project List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Projects you have access to.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading projects...
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 text-center">
            <FolderKanban
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-semibold text-slate-800">
              No projects found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              You haven't joined any matching projects yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-sm"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-3 text-indigo-600">
                      <FolderKanban size={22} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {project.name}
                      </h3>

                      <p className="mt-1 text-xs font-medium text-indigo-600">
                        {project.projectKey}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                </div>

                {/* Description */}
                <p className="mt-5 min-h-10 text-sm leading-6 text-slate-500">
                  {project.description ||
                    "No project description provided."}
                </p>

                {/* Project Date */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={15} />
                    {formatDate(project.createdAt)}
                  </div>
                </div>

                {/* View Project Details */}
                <button
                  onClick={() => handleViewDetails(project.id)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  View Project Details
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Project Count */}
        {!loading && (
          <p className="mt-5 text-xs text-slate-400">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        )}
      </section>
    </div>
  );
}

export default DeveloperProjects;
