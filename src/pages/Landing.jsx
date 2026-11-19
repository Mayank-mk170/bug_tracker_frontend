
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bug,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  Plus,
  Search,
  Bell,
  LayoutDashboard,
  FolderKanban,
  Users,
} from "lucide-react";

export default function Landing() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    navigate("/register", {
      state: { email },
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl">
              <Bug className="text-white" size={25} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Bug Tracker
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-9 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600">Features</a>
            <a href="#solutions" className="hover:text-indigo-600">Solutions</a>
            <a href="#preview" className="hover:text-indigo-600">Dashboard</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 font-semibold text-slate-700 hover:text-indigo-600"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-semibold transition"
            >
               Sign Up
            </Link>
          </div>

        </nav>
      </header>

      {/* HERO */}
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute right-0 top-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT CONTENT */}
            <div>
              <span className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-7">
                <Bug size={16} />
                Smart Bug & Project Management
              </span>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Track bugs.
                <span className="block text-indigo-600">
                  Build better.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 mt-7 max-w-xl leading-relaxed">
                Bring your development team together. Track issues,
                manage projects, assign tasks and deliver better
                software with one simple workspace.
              </p>

              <div className="mt-9 max-w-xl">
                <form onSubmit={handleSignup}>
                  <label className="block text-sm font-semibold mb-2">
                    Get started with your work email
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 min-w-0 border border-slate-300 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                    >
                      Sign up <ArrowRight size={18} />
                    </button>
                  </div>
                </form>

                <p className="text-sm text-slate-400 mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-600 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="flex flex-wrap gap-6 mt-10 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-500" />
                  Easy issue tracking
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-green-500" />
                  Team collaboration
                </span>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-100 blur-3xl opacity-40 rounded-full" />

              <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">

                {/* Preview Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <Bug size={19} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">Bug Tracker</h3>
                      <p className="text-xs text-slate-400">Workspace Overview</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-slate-400">
                    <Search size={19} />
                    <Bell size={19} />
                  </div>
                </div>

                <div className="flex min-h-[370px]">
                  {/* Sidebar */}
                  <aside className="hidden sm:block w-44 border-r border-slate-100 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-4">
                      Workspace
                    </p>

                    <div className="space-y-4 text-sm">
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                        <LayoutDashboard size={17} /> Dashboard
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <FolderKanban size={17} /> Projects
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Bug size={17} /> Issues
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users size={17} /> Team
                      </div>
                    </div>
                  </aside>

                  {/* Dashboard Content */}
                  <div className="flex-1 p-5 min-w-0 bg-slate-50">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className="font-bold text-lg">Dashboard</h3>
                        <p className="text-xs text-slate-400">
                          Your project at a glance
                        </p>
                      </div>

                      <button className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-1">
                        <Plus size={14} /> New Issue
                      </button>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className="bg-white rounded-xl border border-slate-200 p-3">
                        <FolderKanban size={17} className="text-indigo-600 mb-2"/>
                        <p className="text-xl font-bold">08</p>
                        <p className="text-[10px] text-slate-400">Projects</p>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 p-3">
                        <Bug size={17} className="text-orange-500 mb-2"/>
                        <p className="text-xl font-bold">24</p>
                        <p className="text-[10px] text-slate-400">Issues</p>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 p-3">
                        <Users size={17} className="text-green-500 mb-2"/>
                        <p className="text-xl font-bold">12</p>
                        <p className="text-[10px] text-slate-400">Members</p>
                      </div>
                    </div>

                    {/* Issues */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-sm">Recent Issues</h4>
                        <span className="text-xs text-indigo-600">View all</span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Circle size={15} className="text-orange-500 shrink-0"/>
                            <span className="text-xs truncate">Login validation issue</span>
                          </div>
                          <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded shrink-0">
                            TODO
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Clock3 size={15} className="text-blue-500 shrink-0"/>
                            <span className="text-xs truncate">API response error</span>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded shrink-0">
                            IN PROGRESS
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 size={15} className="text-green-500 shrink-0"/>
                            <span className="text-xs truncate">Dashboard UI update</span>
                          </div>
                          <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded shrink-0">
                            DONE
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-slate-400 mt-5">
                A preview of your Bug Tracker workspace
              </p>
            </div>

          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-indigo-600 font-semibold mb-3">
                EVERYTHING IN ONE PLACE
              </p>

              <h2 className="text-4xl font-bold tracking-tight">
                Everything your team needs
              </h2>

              <p className="text-slate-500 mt-4">
                Manage development work from planning to completion.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-7">
              {[
                {
                  icon: FolderKanban,
                  title: "Project Management",
                  description: "Organize projects and keep your development work structured.",
                },
                {
                  icon: Bug,
                  title: "Issue Tracking",
                  description: "Create, assign, prioritize and track bugs in one place.",
                },
                {
                  icon: Users,
                  title: "Team Collaboration",
                  description: "Connect managers and developers with clear responsibilities.",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition"
                  >
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl w-fit">
                      <Icon size={25} />
                    </div>

                    <h3 className="text-xl font-bold mt-6">
                      {feature.title}
                    </h3>

                    <p className="text-slate-500 leading-relaxed mt-3">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="solutions" className="py-20">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold">
              Ready to organize your development work?
            </h2>

            <p className="text-slate-500 mt-4">
              Bring your team and projects together with Bug Tracker.
            </p>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition"
            >
              Get started for free <ArrowRight size={18}/>
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Bug size={20} className="text-indigo-600"/>
            Bug Tracker
          </div>

          <p className="text-sm text-slate-400">
            © 2026 Bug Tracker. All rights reserved.
          </p>

         
        </div>
      </footer>

    </div>
  );
}
