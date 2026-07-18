"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Trash2,
  Pencil,
  KeyRound,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  getStaff,
  createStaff,
  updateStaff,
  updateStaffPassword,
  deleteStaff,
  getPermissionsCatalog,
  type StaffUser,
  type PermissionResource,
} from "@/app/api/service/api";
import { usePermissions } from "@/app/lib/permissions";

const ACTION_LABELS: Record<string, string> = {
  view: "Ko'rish",
  create: "Qo'shish",
  edit: "Tahrirlash",
  delete: "O'chirish",
};

interface FormState {
  id?: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  role: "OWNER" | "STAFF";
  permissions: Set<string>;
  isActive: boolean;
}

const emptyForm = (): FormState => ({
  name: "",
  surname: "",
  email: "",
  password: "",
  role: "STAFF",
  permissions: new Set(),
  isActive: true,
});

export default function StaffPage() {
  const router = useRouter();
  const { isOwner, ready } = usePermissions();

  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [catalog, setCatalog] = useState<PermissionResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Faqat OWNER kira oladi
  useEffect(() => {
    if (ready && !isOwner) router.replace("/");
  }, [ready, isOwner, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, cat] = await Promise.all([getStaff(), getPermissionsCatalog()]);
      setStaff(list);
      setCatalog(cat);
    } catch (e: any) {
      setError(typeof e === "string" ? e : e?.message || "Yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, load]);

  const openCreate = () => {
    setForm(emptyForm());
    setEditing(false);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (s: StaffUser) => {
    setForm({
      id: s.id,
      name: s.name,
      surname: s.surname ?? "",
      email: s.email,
      password: "",
      role: s.role,
      permissions: new Set(s.permissions),
      isActive: s.isActive,
    });
    setEditing(true);
    setFormError(null);
    setModalOpen(true);
  };

  const togglePerm = (key: string) => {
    setForm((f) => {
      const next = new Set(f.permissions);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...f, permissions: next };
    });
  };

  const toggleResourceAll = (res: PermissionResource) => {
    setForm((f) => {
      const next = new Set(f.permissions);
      const keys = res.actions.map((a) => `${res.key}.${a}`);
      const allOn = keys.every((k) => next.has(k));
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return { ...f, permissions: next };
    });
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Ism va email majburiy");
      return;
    }
    if (!editing && form.password.trim().length < 6) {
      setFormError("Parol kamida 6 ta belgi");
      return;
    }
    setSaving(true);
    try {
      const permissions = form.role === "OWNER" ? [] : Array.from(form.permissions);
      if (editing && form.id) {
        await updateStaff(form.id, {
          name: form.name.trim(),
          surname: form.surname.trim(),
          role: form.role,
          permissions,
          isActive: form.isActive,
        });
        if (form.password.trim()) {
          await updateStaffPassword(form.id, form.password.trim());
        }
      } else {
        await createStaff({
          name: form.name.trim(),
          surname: form.surname.trim() || undefined,
          email: form.email.trim(),
          password: form.password.trim(),
          role: form.role,
          permissions,
        });
      }
      setModalOpen(false);
      await load();
    } catch (e: any) {
      setFormError(typeof e === "string" ? e : e?.message || "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: StaffUser) => {
    if (!confirm(`${s.name} (${s.email}) o'chirilsinmi?`)) return;
    try {
      await deleteStaff(s.id);
      await load();
    } catch (e: any) {
      alert(typeof e === "string" ? e : e?.message || "O'chirishda xatolik");
    }
  };

  if (!ready || (ready && !isOwner)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 text-sm bg-[#0a0a0a]">
        Tekshirilmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 md:p-10 font-sans text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Xodimlar</h1>
              <p className="text-white/40 text-sm">
                Ishchi akkauntlari va ruxsatlarni boshqarish
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2.5 rounded-xl hover:bg-white/90 transition"
          >
            <Plus size={18} /> Yangi xodim
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/40">
            <Loader2 className="animate-spin mr-2" /> Yuklanmoqda...
          </div>
        ) : (
          <div className="space-y-3">
            {staff.map((s) => (
              <div
                key={s.id}
                className="bg-zinc-950 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {s.name} {s.surname ?? ""}
                    </span>
                    {s.role === "OWNER" ? (
                      <span className="text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck size={11} /> Owner
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                        Xodim
                      </span>
                    )}
                    {s.isActive ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                  </div>
                  <div className="text-white/40 text-sm truncate">{s.email}</div>
                  <div className="text-white/30 text-xs mt-1">
                    {s.role === "OWNER"
                      ? "Barcha ruxsatlar"
                      : `${s.permissions.length} ta ruxsat`}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition"
                    title="Tahrirlash"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-white/70 transition"
                    title="O'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {staff.length === 0 && (
              <div className="text-center py-16 text-white/40">
                Hali xodim yo&apos;q
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold">
                {editing ? "Xodimni tahrirlash" : "Yangi xodim"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ism">
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Field>
                <Field label="Familiya">
                  <input
                    className="input"
                    value={form.surname}
                    onChange={(e) => setForm({ ...form, surname: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Email">
                <input
                  type="email"
                  className="input disabled:opacity-50"
                  value={form.email}
                  disabled={editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>

              <Field
                label={editing ? "Yangi parol (o'zgartirmaslik uchun bo'sh)" : "Parol"}
              >
                <input
                  type="password"
                  className="input"
                  placeholder={editing ? "••••••" : "kamida 6 ta belgi"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Rol">
                  <select
                    className="input"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as "OWNER" | "STAFF" })
                    }
                  >
                    <option value="STAFF">Xodim (cheklangan)</option>
                    <option value="OWNER">Owner (to&apos;liq huquq)</option>
                  </select>
                </Field>
                {editing && (
                  <Field label="Holat">
                    <select
                      className="input"
                      value={form.isActive ? "1" : "0"}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.value === "1" })
                      }
                    >
                      <option value="1">Faol</option>
                      <option value="0">Bloklangan</option>
                    </select>
                  </Field>
                )}
              </div>

              {/* Ruxsatlar matritsasi (faqat STAFF uchun) */}
              {form.role === "STAFF" && (
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/40 mb-3">
                    Ruxsatlar
                  </div>
                  <div className="space-y-2">
                    {catalog.map((res) => {
                      const keys = res.actions.map((a) => `${res.key}.${a}`);
                      const allOn = keys.every((k) => form.permissions.has(k));
                      return (
                        <div
                          key={res.key}
                          className="bg-white/[0.03] border border-white/10 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{res.label}</span>
                            <button
                              type="button"
                              onClick={() => toggleResourceAll(res)}
                              className="text-[11px] text-white/50 hover:text-white underline"
                            >
                              {allOn ? "Barchasini olib tashlash" : "Barchasini tanlash"}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {res.actions.map((a) => {
                              const key = `${res.key}.${a}`;
                              const on = form.permissions.has(key);
                              return (
                                <button
                                  type="button"
                                  key={key}
                                  onClick={() => togglePerm(key)}
                                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                                    on
                                      ? "bg-white text-black border-white"
                                      : "bg-transparent text-white/50 border-white/15 hover:border-white/40"
                                  }`}
                                >
                                  {ACTION_LABELS[a] ?? a}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {formError && (
                <div className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-2.5">
                  {formError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-white/60 hover:bg-white/5 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-white text-black font-medium px-5 py-2.5 rounded-xl hover:bg-white/90 transition disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saqlanmoqda...
                  </>
                ) : editing ? (
                  <>
                    <KeyRound size={16} /> Saqlash
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Yaratish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #18181b;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 0.65rem 0.9rem;
          color: white;
          outline: none;
          font-size: 0.9rem;
        }
        :global(.input:focus) {
          border-color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-white/40 block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
