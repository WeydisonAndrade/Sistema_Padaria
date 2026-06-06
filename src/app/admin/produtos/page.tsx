"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Eye, Search } from "lucide-react";
import ProductDetailModal from "@/components/admin/ProductDetailModal";
import { PRODUCT_CATEGORIES, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  weight: string;
  ingredients: string;
  available: boolean;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "Pães",
  imageUrl: "",
  weight: "",
  ingredients: "",
  available: true,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  useEffect(() => {
    async function checkAuthAndLoad() {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/admin/login");
        return;
      }
      await loadProducts();
    }

    checkAuthAndLoad();
  }, [router]);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/products?available=false");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        search === "" ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "Todos" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function showSuccessMessage(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      imageUrl: product.imageUrl || "",
      weight: product.weight || "",
      ingredients: product.ingredients || "",
      available: product.available,
    });
    setShowForm(true);
    setError("");
  }

  function openViewProduct(product: Product) {
    setViewingProduct(product);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar produto");
      setSaving(false);
      return;
    }

    const wasEditing = !!editingId;

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    await loadProducts();
    setSaving(false);
    showSuccessMessage(
      wasEditing ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!"
    );
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadProducts();
      showSuccessMessage("Produto excluído com sucesso!");
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Cadastro de Produtos
          </h1>
          <p className="text-muted">
            Cadastrar, editar, excluir e consultar produtos
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Produto
        </button>
      </div>

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Consultar — busca e filtros */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Consultar produto por nome, descrição ou categoria..."
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="Todos">Todas as categorias</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {editingId ? "Editar Produto" : "Cadastrar Produto"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Descrição *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Categoria *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">URL da Imagem</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Peso/Tamanho</label>
                  <input
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    placeholder="Ex: 500g"
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Ingredientes</label>
                  <input
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    placeholder="Ex: Farinha, ovos..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.checked })}
                  className="rounded border-border"
                />
                <span className="text-sm">Produto disponível</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={openEditForm}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-secondary/30 px-6 py-3 text-sm text-muted">
            {filteredProducts.length} produto(s) encontrado(s)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted">Produto</th>
                  <th className="px-6 py-3 text-left font-medium text-muted">Categoria</th>
                  <th className="px-6 py-3 text-left font-medium text-muted">Preço</th>
                  <th className="px-6 py-3 text-left font-medium text-muted">Status</th>
                  <th className="px-6 py-3 text-right font-medium text-muted">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted line-clamp-1">{product.description}</p>
                    </td>
                    <td className="px-6 py-4 text-muted">{product.category}</td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.available ? "Disponível" : "Indisponível"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openViewProduct(product)}
                          title="Consultar"
                          className="rounded-lg p-2 text-muted hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditForm(product)}
                          title="Editar"
                          className="rounded-lg p-2 text-muted hover:bg-secondary hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          title="Excluir"
                          className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-sm">
          <p className="text-muted">
            {search || categoryFilter !== "Todos"
              ? "Nenhum produto encontrado para esta consulta."
              : "Nenhum produto cadastrado."}
          </p>
          {!search && categoryFilter === "Todos" && (
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-4 text-primary hover:underline"
            >
              Cadastrar primeiro produto
            </button>
          )}
        </div>
      )}
    </div>
  );
}
