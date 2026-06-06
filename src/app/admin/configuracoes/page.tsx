"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { BakerySettings } from "@/types";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<BakerySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch("/api/settings");
      const data = await res.json();
      setForm(data);
      setLoading(false);
    }

    loadSettings();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;

    setSaving(true);
    setMessage("");

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("Configurações salvas com sucesso!");
    } else {
      setMessage("Erro ao salvar configurações.");
    }
    setSaving(false);
  }

  if (loading || !form) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted">
          Gerencie informações da padaria, localização e WhatsApp
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {message && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.includes("sucesso")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">Nome da Padaria</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Endereço</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Telefone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="5511999999999"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">WhatsApp</label>
            <input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="5511999999999"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted">
              Número com código do país (ex: 5511999999999)
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Horário de Funcionamento</label>
          <input
            value={form.openingHours}
            onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <h3 className="mb-3 font-medium text-foreground">Localização no Mapa</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Latitude</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) =>
                  setForm({ ...form, latitude: parseFloat(e.target.value) })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Longitude</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: parseFloat(e.target.value) })
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted">
            Use o Google Maps para obter as coordenadas: clique com botão direito no local → coordenadas.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </form>
    </div>
  );
}
