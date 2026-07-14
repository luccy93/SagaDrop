import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { fetchCustomers } from "@/lib/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers().then(setCustomers).catch(() => setCustomers([])).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((u) =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Customers</h1>
          <p className="text-sm text-[#555] mt-1">{customers.length} registered users</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-10 pr-4 py-2.5 border border-black/10 text-sm focus:outline-none focus:border-[#0a0a0a]" />
        </div>
      </div>

      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#fafafa] border-b border-black/10">
                {["Name", "Email", "Role", "Verified", "Joined"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 eyebrow text-[#777]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-black/5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4"><div className="h-4 bg-[#f0f0f0] animate-pulse" /></td>
                  ))}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-sm text-[#999]">No users found.</td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} className={`border-t border-black/5 hover:bg-[#fafafa] transition-colors ${i % 2 === 0 ? "bg-white" : "bg-[#fdfdfd]"}`}>
                  <td className="px-5 py-3 font-semibold flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#0a0a0a] text-white grid place-items-center text-xs font-bold">
                      {(u.name || "?")[0].toUpperCase()}
                    </span>
                    {u.name}
                  </td>
                  <td className="px-5 py-3 text-[#555]">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 font-semibold ${u.role === "admin" ? "bg-[#E3F2FD] text-[#1565C0]" : "bg-[#f0f0f0] text-[#555]"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {u.email_verified ? (
                      <span className="text-[#2E7D32] text-xs font-semibold">Verified</span>
                    ) : (
                      <span className="text-[#c62828] text-xs font-semibold">Unverified</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-[#777]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
