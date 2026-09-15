"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-spinner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

const SECTIONS = [
  { id: "dashboard", label: "Panel Principal", icon: "📊" },
  { id: "buses", label: "Buses", icon: "🚌" },
  { id: "drivers", label: "Conductores", icon: "👤" },
  { id: "routes", label: "Rutas", icon: "🗺️" },
  { id: "trips", label: "Viajes", icon: "🗓️" },
  { id: "planning", label: "Planificación", icon: "📋" },
  { id: "contingencies", label: "Contingencias", icon: "🚨" },
  { id: "extraboard", label: "Extraboard", icon: "👥" },
  { id: "import", label: "Importar", icon: "📥" },
  { id: "reports", label: "Reportes", icon: "📊" },
  { id: "audit", label: "Auditoría", icon: "📝" },
  { id: "settings", label: "Configuración", icon: "⚙️" },
  { id: "users", label: "Usuarios", icon: "👥" },
];

const ROLES = [
  { id: "ADMIN", label: "Administrador", description: "Acceso total + gestión de usuarios" },
  { id: "PLANNER", label: "Planificador", description: "Puede planificar y asignar viajes" },
  { id: "OPERATOR", label: "Operador", description: "Puede ver y gestionar operaciones" },
  { id: "VIEWER", label: "Observador", description: "Solo lectura" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("VIEWER");
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  function openCreate() {
    setEditingUser(null);
    setFormEmail("");
    setFormName("");
    setFormPassword("");
    setFormRole("VIEWER");
    setFormPermissions([]);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormName(user.name);
    setFormPassword("");
    setFormRole(user.role);
    setFormPermissions([...user.permissions]);
    setFormError("");
    setShowForm(true);
  }

  function togglePermission(sectionId: string) {
    setFormPermissions((prev) =>
      prev.includes(sectionId)
        ? prev.filter((p) => p !== sectionId)
        : [...prev, sectionId]
    );
  }

  function selectAllPermissions() {
    setFormPermissions(SECTIONS.map((s) => s.id));
  }

  function clearAllPermissions() {
    setFormPermissions([]);
  }

  async function handleSave() {
    setFormError("");
    setSaving(true);

    try {
      const body: any = {
        email: formEmail,
        name: formName,
        role: formRole,
        permissions: formPermissions,
      };

      if (formPassword) {
        body.password = formPassword;
      }

      if (editingUser) {
        body.id = editingUser.id;
        if (!formPassword) delete body.password;
      } else {
        if (!formPassword) {
          setFormError("La contraseña es requerida para nuevos usuarios");
          setSaving(false);
          return;
        }
      }

      const res = await fetch("/api/users", {
        method: editingUser ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Error al guardar");
        setSaving(false);
        return;
      }

      setShowForm(false);
      fetchUsers();
    } catch (error) {
      setFormError("Error al guardar");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/users?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchUsers();
  }

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrador",
    PLANNER: "Planificador",
    OPERATOR: "Operador",
    VIEWER: "Observador",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        subtitle={`${users.length} usuarios registrados`}
        action={{ label: "+ Nuevo Usuario", onClick: openCreate }}
      />

      {loading ? (
        <LoadingPage />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permisos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === "ADMIN" ? "bg-purple-100 text-purple-700" :
                      user.role === "PLANNER" ? "bg-blue-100 text-blue-700" :
                      user.role === "OPERATOR" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {user.role === "ADMIN" ? (
                      <span className="text-purple-600 font-medium">Acceso total</span>
                    ) : (
                      <span>{user.permissions.length} secciones</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(user.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="juan@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña {editingUser && "(dejar vacío para mantener)"}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setFormRole(role.id)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formRole === role.id
                          ? "border-slate-900 bg-slate-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{role.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formRole !== "ADMIN" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Secciones permitidas</label>
                    <div className="flex gap-2">
                      <button onClick={selectAllPermissions} className="text-xs text-blue-600 hover:text-blue-800">
                        Todas
                      </button>
                      <button onClick={clearAllPermissions} className="text-xs text-gray-500 hover:text-gray-700">
                        Ninguna
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTIONS.map((section) => (
                      <label
                        key={section.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          formPermissions.includes(section.id)
                            ? "border-blue-300 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formPermissions.includes(section.id)}
                          onChange={() => togglePermission(section.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{section.icon} {section.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Guardando..." : editingUser ? "Guardar Cambios" : "Crear Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar usuario"
        message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
        variant="danger"
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
