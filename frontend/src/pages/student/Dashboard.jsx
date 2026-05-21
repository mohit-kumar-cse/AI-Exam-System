//  frontend\src\pages\student\Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import NeuCard from "../../components/ui/NeuCard";

export default function Dashboard() {
  const { token, user } = useAuth(); // ✅ Get user from context

  const [data, setData] = useState({
    name: "",
    roll: "",
    upcomingExam: null,
    rank: ""
  });

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/student/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Get first letter of name for avatar
  const getInitial = () => {
    return (user?.name || data.name || "S").charAt(0).toUpperCase();
  };

  return (
    <div className="grid grid-cols-3 gap-6">

      {/* Student Info */}
      <NeuCard>
        <div className="flex items-center gap-6">
          {/* ✅ Dynamic Avatar with First Letter */}
          <div
            className="
              w-24 h-24 rounded-full
              flex items-center justify-center
              bg-linear-to-br from-blue-400 to-blue-600
              shadow-[6px_6px_12px_#cfd5dd,-6px_-6px_12px_#ffffff]
            "
          >
            <span className="text-4xl font-bold text-white">
              {getInitial()}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-lg">Student</h3>
            <p className="text-lg font-medium">{data.name || user?.name}</p>
            <p className="text-sm text-gray-600">{user?.email || "No email"}</p>
          </div>
        </div>
      </NeuCard>

      {/* Upcoming Exam */}
      <NeuCard>
        <h3 className="font-semibold">Upcoming Exam</h3>
        {data.upcomingExam ? (
          <>
            <p>{data.upcomingExam.title}</p>
            <p className="text-sm text-gray-600">
              {data.upcomingExam.date}
            </p>
          </>
        ) : (
          <p className="text-gray-500">No upcoming exam</p>
        )}
      </NeuCard>

      {/* Rank */}
      <NeuCard>
        <h3 className="font-semibold">Rank</h3>
        <p className="text-3xl font-bold mt-2">
          {data.rank || "N/A"}
        </p>
      </NeuCard>

    </div>
  );
}