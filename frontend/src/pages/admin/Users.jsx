// src/pages/admin/Users.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import NeuCard from "../../components/ui/NeuCard";
import api from "../../services/api";

// ── Portal Dropdown — unchanged, already well-built ──────────────────────────
function Dropdown({ value, options, onChange }) {
  const [open,     setOpen]     = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref         = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top:   rect.bottom + window.scrollY,
        left:  rect.left   + window.scrollX,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (
        ref.current         && !ref.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div
        ref={ref}
        onClick={() => setOpen(!open)}
        className="bg-[#1e293b] text-white px-3 py-2 rounded-lg cursor-pointer border border-gray-600 flex justify-between items-center select-none"
      >
        <span className="capitalize">{value}</span>
        <span className="text-gray-400">▾</span>
      </div>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: "absolute", top: position.top, left: position.left, width: position.width, zIndex: 9999 }}
          className="bg-[#0f172a] border border-gray-700 rounded-lg shadow-xl overflow-hidden"
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`px-3 py-2 cursor-pointer capitalize hover:bg-blue-600 transition ${value === opt ? "bg-blue-500 text-white" : "text-gray-300"}`}
            >
              {opt}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Add User Modal ────────────────────────────────────────────────────────────
function AddUserModal({ show, formData, setFormData, onCreate, onClose }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0f172a] p-6 rounded-xl w-96 space-y-3 border border-gray-700">
        <h3 className="text-xl font-semibold text-white">Create User</h3>

        {[
          { placeholder: "Full Name",     key: "name",     type: "text"     },
          { placeholder: "Email Address", key: "email",    type: "email"    },
          { placeholder: "Password",      key: "password", type: "password" },
        ].map(({ placeholder, key, type }) => (
          <input
            key={key}
            type={type}
            placeholder={placeholder}
            className="w-full bg-[#1e293b] border border-gray-700 p-2 rounded-lg text-white"
            value={formData[key]}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          />
        ))}

        <Dropdown
          value={formData.role}
          options={["student", "examiner", "admin"]}
          onChange={(role) => setFormData({ ...formData, role })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-white/5 transition">
            Cancel
          </button>
          <button onClick={onCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: "", email: "", password: "", role: "student" };

export default function Users() {
  const [users,        setUsers]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData,     setFormData]     = useState(EMPTY_FORM);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Filter derived — no separate state needed ─────────────────────────────
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill all fields");
      return;
    }
    try {
      await api.post("/admin/users", formData);
      setShowAddModal(false);
      setFormData(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      fetchUsers();
    } catch {
      alert("Role update failed");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {users.length} total user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-medium transition"
        >
          + Add User
        </button>
      </div>

      {/* FILTERS */}
      <NeuCard>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#0f172a] border border-gray-700 p-2 rounded-lg text-white"
          />
          <div className="w-full md:w-48">
            <Dropdown
              value={roleFilter}
              options={["all", "student", "examiner", "admin"]}
              onChange={setRoleFilter}
            />
          </div>
        </div>
      </NeuCard>

      {/* TABLE */}
      <NeuCard>
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No users match your search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-left">
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-800 hover:bg-white/5 transition">
                    <td className="p-3">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </td>
                    <td className="p-3 w-44">
                      <Dropdown
                        value={user.role}
                        options={["student", "examiner", "admin"]}
                        onChange={(role) => handleChangeRole(user._id, role)}
                      />
                    </td>
                    <td className="p-3 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-400 hover:text-red-300 text-sm transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </NeuCard>

      <AddUserModal
        show={showAddModal}
        formData={formData}
        setFormData={setFormData}
        onCreate={handleCreateUser}
        onClose={() => { setShowAddModal(false); setFormData(EMPTY_FORM); }}
      />
    </div>
  );
}