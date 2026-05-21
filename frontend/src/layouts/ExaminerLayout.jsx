// src/layouts/ExaminerLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import Navbar from "../components/common/Navbar";

const LINKS = [
  { name: "Dashboard",         path: "/examiner",         icon: "dashboard" },
  { name: "Exam Management",   path: "/examiner/manage",  icon: "manage"    },
  { name: "Create Exam",       path: "/examiner/create",  icon: "create"    },
  { name: "Upload Answer Key", path: "/examiner/upload",  icon: "upload"    },
  { name: "Monitor",           path: "/examiner/monitor", icon: "monitor"   },
];

const TITLE_MAP = [
  { match: "/examiner/manage",  title: "Exam Management"    },
  { match: "/examiner/create",  title: "Create Exam"        },
  { match: "/examiner/upload",  title: "Upload Answer Key"  },
  { match: "/examiner/monitor", title: "Monitor Exams"      },
  { match: "/examiner",         title: "Examiner Dashboard" },
];

function getTitle(pathname) {
  return TITLE_MAP.find((t) => pathname.startsWith(t.match))?.title || "Examiner";
}

export default function ExaminerLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">

      {/* SIDEBAR — fixed height, scrolls independently */}
      <div className="h-screen sticky top-0 shrink-0 overflow-y-auto">
        <Sidebar title="Examiner Panel" links={LINKS} />
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