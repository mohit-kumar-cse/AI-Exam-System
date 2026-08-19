// src/layouts/AdminLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Navbar from "../components/common/Navbar";

 
const LINKS = [
  { name: "Dashboard",        path: "/admin",           icon: "dashboard" },
  { name: "Users",            path: "/admin/users",     icon: "users"     },
  { name: "Assign Examiner",  path: "/admin/assign",    icon: "assign"    },
  { name: "Question Manager", path: "/admin/questions", icon: "questions" },
];

const TITLE_MAP = [
  { match: "/admin/users",     title: "Users Management"  },
  { match: "/admin/assign",    title: "Assign Examiner"   },
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
      <div className="hidden md:flex h-screen sticky top-0 shrink-0 overflow-y-auto">
        <Sidebar title="Admin Panel" links={LINKS} />
      </div>
      <div className="md:hidden">
        <Sidebar title="Admin Panel" links={LINKS} />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 pt-16 sm:p-6 md:p-8 md:pt-8">
          <Navbar title={getTitle(pathname)} />
          <div className="mt-4 sm:mt-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}