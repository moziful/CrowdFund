"use client";

import React, { useEffect, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function ManageUsers({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null); // { userId, name, oldRole, newRole }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("crowd_token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      const res = await fetch("/api/users", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users.");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const triggerRoleChange = (userId, name, oldRole, newRole) => {
    setPendingChange({ userId, name, oldRole, newRole });
    setModalOpen(true);
  };

  const handleRoleChange = async (userId, newRole) => {
    setError("");
    setSuccess("");
    setUpdatingId(userId);

    try {
      const token = localStorage.getItem("crowd_token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/users", {
        method: "PUT",
        headers,
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role.");

      setSuccess(data.message);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
      setPendingChange(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <span className="text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block mb-1">
          Platform Directory
        </span>
        <h2 className="text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
          Manage Users
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Review member registrations, monitor platform wallets, and update authorization roles.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/30">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
          {success}
        </div>
      )}

      {users.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500">
          No registered users found.
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4 font-extrabold">Avatar</th>
                  <th className="px-6 py-4 font-extrabold">Name & Email</th>
                  <th className="px-6 py-4 font-extrabold">Credits Balance</th>
                  <th className="px-6 py-4 font-extrabold">Active Role</th>
                  <th className="px-6 py-4 font-extrabold">Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-700 dark:text-zinc-300">
                {users.map((member) => (
                  <tr key={member._id || member.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/10 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={member.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {member.credits ?? 0} Credits
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold leading-none ${
                        member.role?.toLowerCase() === "admin"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : member.role?.toLowerCase() === "creator"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {updatingId === (member._id || member.id) ? (
                        <span className="text-xs text-zinc-400 animate-pulse font-semibold">Updating...</span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={(e) => triggerRoleChange(member._id || member.id, member.name, member.role, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                        >
                          <option value="Supporter">Supporter</option>
                          <option value="Creator">Creator</option>
                          <option value="Admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingChange(null);
        }}
        onConfirm={() => {
          if (pendingChange) {
            handleRoleChange(pendingChange.userId, pendingChange.newRole);
          }
        }}
        title="Confirm Role Modification"
        message={`Are you sure you want to change the authorization role of ${pendingChange?.name} from ${pendingChange?.oldRole} to ${pendingChange?.newRole}?`}
        confirmText="Confirm Role Change"
        cancelText="Cancel"
        type="warning"
      />

    </div>
  );
}
