
import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  FolderKanban,
  Mail,
  UserRound,
} from "lucide-react";

import { getMyProjects } from "../../services/projectService";
import { getProjectMembers } from "../../services/projectMemberService";

const roleStyles = {
  OWNER: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  DEVELOPER: "bg-green-100 text-green-700",
};

function DeveloperTeam() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const projects = await getMyProjects();

      const teamData = await Promise.all(
        projects.map(async (project) => {
          const members = await getProjectMembers(project.id);

          return {
            projectId: project.id,
            projectName: project.name,
            projectKey: project.projectKey,
            members: Array.isArray(members) ? members : [],
          };
        })
      );

      setTeams(teamData);
    } catch (err) {
      console.error("Failed to load team members:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load team members. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams
    .map((team) => ({
      ...team,
      members: team.members.filter((member) => {
        const keyword = search.toLowerCase();

        return (
          member.email?.toLowerCase().includes(keyword) ||
          member.projectRole?.toLowerCase().includes(keyword) ||
          member.userId?.toLowerCase().includes(keyword)
        );
      }),
    }))
    .filter(
      (team) =>
        team.members.length > 0 ||
        team.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        team.projectKey?.toLowerCase().includes(search.toLowerCase())
    );

  const totalMembers = teams.reduce(
    (total, team) => total + team.members.length,
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Team
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View team members and their roles across your projects.
          </p>
        </div>

        <button
          onClick={fetchTeams}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-indigo-100 p-3 text-indigo-600">
            <FolderKanban size={23} />
          </div>
          <p className="mt-5 text-sm text-slate-500">My Projects</p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "..." : teams.length}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="inline-flex rounded-lg bg-green-100 p-3 text-green-600">
            <Users size={23} />
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Total Team Memberships
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? "..." : totalMembers}
          </h2>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Team Members
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Members belonging to your projects.
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
              placeholder="Search members or projects..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading team members...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={40} className="mx-auto text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-800">
              No team members found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              No members match your search.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTeams.map((team) => (
              <div
                key={team.projectId}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                      <FolderKanban size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {team.projectName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {team.projectKey}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    {team.members.length} Members
                  </span>
                </div>

                {team.members.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-slate-500">
                    No members match your search in this project.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="rounded-full bg-slate-100 p-3 text-slate-600">
                            <UserRound size={20} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {member.email}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                              <Mail size={13} />
                              {member.userId}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            roleStyles[member.projectRole] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {member.projectRole}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DeveloperTeam;
