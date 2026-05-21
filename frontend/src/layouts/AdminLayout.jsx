// src/layouts/AdminLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Navbar from "../components/common/Navbar";

const LINKS = [
  { name: "Dashboard",        path: "/admin",           icon: "dashboard" },
  { name: "Users",            path: "/admin/users",     icon: "users"     },
  { name: "Assign Examiner",  path: "/admin/assign",    icon: "assign"    },
  { name: "System Logs",      path: "/admin/logs",      icon: "logs"      },
  { name: "Question Manager", path: "/admin/questions", icon: "questions" },
];

const TITLE_MAP = [
  { match: "/admin/users",     title: "Users Management"  },
  { match: "/admin/assign",    title: "Assign Examiner"   },
  { match: "/admin/logs",      title: "System Logs"       },
  { match: "/admin/questions", title: "Question Manager"  },
  { match: "/admin",           title: "Admin Dashboard"   },
];

function getTitle(pathname) {
  return TITLE_MAP.find((t) => pathname.startsWith(t.match))?.title || "Admin";
}

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">

      {/* SIDEBAR — fixed height, scrolls independently */}
      <div className="h-screen sticky top-0 shrink-0 overflow-y-auto">
        <Sidebar title="Admin Panel" links={LINKS} />
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