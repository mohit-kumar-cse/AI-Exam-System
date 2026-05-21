// src/layouts/StudentLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Navbar from "../components/common/Navbar";

const LINKS = [
  { name: "Dashboard", path: "/student",         icon: "dashboard" },
  { name: "Exams",     path: "/student/exams",   icon: "exams"     },
  { name: "Results",   path: "/student/results", icon: "results"   },
  { name: "Profile",   path: "/student/profile", icon: "profile"   },
];

const TITLE_MAP = [
  { match: "/student/exams",   title: "My Exams"          },
  { match: "/student/results", title: "Results"           },
  { match: "/student/profile", title: "Profile"           },
  { match: "/student",         title: "Student Dashboard" },
];

function getTitle(pathname) {
  return TITLE_MAP.find((t) => pathname.startsWith(t.match))?.title || "Student";
}

export default function StudentLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">

      {/* SIDEBAR — fixed height, scrolls independently */}
      <div className="h-screen sticky top-0 shrink-0 overflow-y-auto">
        <Sidebar title="Student Panel" links={LINKS} />
      </div>

      {/* MAIN — scrollable content area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Navbar title={getTitle(pathname)} />
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
}