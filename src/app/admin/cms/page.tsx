"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AppContentRow {
  scope: string;
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

const SCOPES = [
  "home", "chat", "community", "events", "exhibitors", "give", "global",
  "live", "members", "more", "notes", "podcasts", "prayer", "profile",
  "schedule", "settings", "social", "vod"
];

export default function CmsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AppContentRow[]>([]);
  const [scopeFilter, setScopeFilter] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [editingRow, setEditingRow] = useState<AppContentRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("app_content")
        .select("*")
        .order("scope")
        .order("key");

      if (error) throw error;
      setRows(data || []);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleSave(row: AppContentRow) {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("app_content")
        .upsert([{
          scope: row.scope,
          key: row.key,
          value: row.value,
          description: row.description,
          updated_at: new Date().toISOString(),
        }], { onConflict: "scope,key" });

      if (error) throw error;

      await loadContent();
      showMessage("success", "Saved!");
      setIsModalOpen(false);
      setEditingRow(null);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const filteredRows = scopeFilter
    ? rows.filter(r => r.scope === scopeFilter)
    : rows;

  if (loading) {
    return <div className="py-20 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">App Content Editor</h2>
      <p className="text-gray-600 mb-4">Edit content that appears in the Flutter app.</p>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="mb-4">
        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">All scopes</option>
          {SCOPES.map(scope => (
            <option key={scope} value={scope}>{scope}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-200 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold">Scope</th>
              <th className="px-4 py-3 text-left font-semibold">Key</th>
              <th className="px-4 py-3 text-left font-semibold">Value</th>
              <th className="px-4 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={`${row.scope}-${row.key}`} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{row.scope}</td>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{row.key}</td>
                <td className="px-4 py-3 text-gray-900 max-w-md truncate">{row.value}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setEditingRow(row);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && editingRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold mb-4">Edit Content</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Scope</label>
                <input
                  type="text"
                  value={editingRow.scope}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Key</label>
                <input
                  type="text"
                  value={editingRow.key}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Value</label>
                <textarea
                  value={editingRow.value}
                  onChange={(e) => setEditingRow({ ...editingRow, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded font-mono h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={editingRow.description || ""}
                  onChange={(e) => setEditingRow({ ...editingRow, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRow(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded text-gray-900 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(editingRow)}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
