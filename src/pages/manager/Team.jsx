
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  UserPlus,
  Trash2,
  FolderKanban,
  Mail,
  AlertCircle,
  X,
} from "lucide-react";

import { getMyProjects } from "../../services/projectService";
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "../../services/projectMemberService";

const roleStyles = {
  OWNER: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  DEVELOPER: "bg-green-100 text-green-700",
};

function Team() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [projectRole, setProjectRole] = useState("DEVELOPER");
  const [submitting, setSubmitting] = useState(false);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyProjects();
      const projectList = Array.isArray(data) ? data : [];

      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProjectId((current) =>
          projectList.some((project) => project.id === current)
            ? current
            : projectList[0].id
        );
      } else {
        setSelectedProjectId("");
        setMembers([]);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError(
        err.response?.data?.message || "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (projectId) => {
    if (!projectId) {
      setMembers([]);
      return;
    }

    try {
      setMembersLoading(true);
      setError("");

      const data = await getProjectMembers(projectId);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load members:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load project members."
      );
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchMembers(selectedProjectId);
    }
  }, [selectedProjectId]);

  const filteredMembers = useMemo(() => {
    const keyword = search.toLowerCase();

    return members.filter(
      (member) =>
        member.email?.toLowerCase().includes(keyword) ||
        member.projectRole?.toLowerCase().includes(keyword)
    );
  }, [members, search]);

  const handleAddMember = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await addProjectMember(selectedProjectId, {
        email: email.trim().toLowerCase(),
        projectRole,
      });

      setSuccess("Team member added successfully.");
      setEmail("");
      setProjectRole("DEVELOPER");
      setShowModal(false);

      await fetchMembers(selectedProjectId);
    } catch (err) {
      console.error("Failed to add member:", err);
      setError(
        err.response?.data?.message ||
          "Unable to add team member."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (member) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${member.email} from this project?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await removeProjectMember(selectedProjectId, member.userId);

      setSuccess("Team member removed successfully.");
      await fetchMembers(selectedProjectId);
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError(
        err.response?.data?.message ||
          "Unable to remove team member."
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Team Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage members and roles across your projects.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchProjects();
              if (selectedProjectId) fetchMembers(selectedProjectId);
            }}
            disabled={loading || membersLoading}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setShowModal(true);
            }}
            disabled={!selectedProjectId}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <UserPlus size={17} />
            Add Member
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-indigo-100 p-3 text-indigo-600">
            <FolderKanban size={23} />
          </div>
          <p className="mt-5 text-sm text-slate-500">Total Projects</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "..." : projects.length}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-green-100 p-3 text-green-600">
            <Users size={23} />
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Members in Selected Project
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {membersLoading ? "..." : members.length}
          </h2>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="font-semibold text-slate-900">
            Select Project
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose a project to manage its team.
          </p>
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            setSearch("");
            setSuccess("");
            setError("");
          }}
          disabled={loading || projects.length === 0}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 md:max-w-md"
        >
          {projects.length === 0 && (
            <option value="">No projects available</option>
          )}

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project.projectKey})
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Project Members
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedProject?.name || "Select a project"}
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
              placeholder="Search members..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading || membersLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading team members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={40} className="mx-auto text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-800">
              No team members found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add a member or try a different search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="pb-4 pr-4">Member</th>
                  <th className="pb-4 pr-4">User ID</th>
                  <th className="pb-4 pr-4">Project Role</th>
                  <th className="pb-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-slate-100 p-3 text-slate-600">
                          <Mail size={18} />
                        </div>
                        <span className="font-medium text-slate-800">
                          {member.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-5 pr-4 text-xs text-slate-500">
                      {member.userId}
                    </td>

                    <td className="py-5 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          roleStyles[member.projectRole] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {member.projectRole}
                      </span>
                    </td>

                    <td className="py-5">
                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={member.projectRole === "OWNER"}
                        title={
                          member.projectRole === "OWNER"
                            ? "Project owner cannot be removed"
                            : "Remove member"
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !membersLoading && (
          <p className="mt-5 text-xs text-slate-400">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Add Team Member
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a member to {selectedProject?.name}.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Member Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project Role
                </label>
                <select
                  value={projectRole}
                  onChange={(e) => setProjectRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="DEVELOPER">Developer</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Team;
