"use client";

import { useEffect, useState } from "react";
import {
  allProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/api/service/api";
import { FileUp, Trash, Pencil, Coins, X } from "lucide-react";
import { toast } from "react-toastify";

interface ProductType {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

const ShopPage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setPrice("");
    setImage(null);
    setPreview(null);
    setEditingId(null);
  };

  const fetchData = async () => {
    try {
      const res = await allProducts();
      setProducts(res.data || []);
    } catch (err) {
      toast.error("Mahsulotlarni yuklab bo'lmadi: " + err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) {
      return toast.error("Nom va narxni to'ldiring");
    }
    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return toast.error("Narx noto'g'ri");
    }
    if (!editingId && !image) {
      return toast.error("Mahsulot rasmini yuklang");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("price", String(Number(price)));
    if (image) formData.append("image", image);

    setLoading(true);
    try {
      if (editingId) await updateProduct(editingId, formData);
      else await createProduct(formData);

      toast.success(`Mahsulot ${editingId ? "yangilandi" : "qo'shildi"}`);
      resetForm();
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: ProductType) => {
    setEditingId(p.id);
    setName(p.name);
    setPrice(String(p.price));
    setPreview(p.imageUrl);
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Mahsulot o'chirilsinmi?")) return;
    try {
      await deleteProduct(id);
      toast.success("O'chirildi");
      fetchData();
    } catch (err) {
      toast.error("Xatolik: " + err);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-gray-900">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* TITLE */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Do&apos;kon</h1>
          {editingId && (
            <button
              onClick={resetForm}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <X size={16} /> Bekor qilish
            </button>
          )}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-2xl p-6 shadow-sm space-y-4"
        >
          {/* IMAGE UPLOAD */}
          <label className="cursor-pointer block">
            <div className="border border-dashed rounded-xl p-6 text-center hover:bg-gray-50 transition">
              {preview ? (
                <img
                  src={preview}
                  className="w-full h-48 object-contain rounded-lg"
                />
              ) : (
                <>
                  <FileUp className="mx-auto mb-2 text-gray-400" size={40} />
                  <p className="text-sm text-gray-500">Mahsulot rasmi</p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>

          {/* INPUTS */}
          <input
            type="text"
            placeholder="Mahsulot nomi"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="relative">
            <input
              type="number"
              min={0}
              placeholder="Narxi (tanga)"
              className="w-full border rounded-lg px-4 py-2 pr-16 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-amber-600">
              <Coins size={16} /> tanga
            </span>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition disabled:opacity-60"
          >
            {loading
              ? "Saqlanmoqda..."
              : editingId
              ? "Mahsulotni yangilash"
              : "Mahsulot qo'shish"}
          </button>
        </form>

        {/* LIST */}
        <div>
          <h2 className="text-xl font-medium mb-4">Mavjud mahsulotlar</h2>

          {products.length === 0 ? (
            <p className="text-gray-400 text-sm">Hozircha mahsulot yo&apos;q.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="border rounded-2xl overflow-hidden hover:shadow-md transition"
                >
                  <div className="w-full h-44 bg-gray-50 flex items-center justify-center">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold">{p.name}</h3>

                    <p className="flex items-center gap-1 text-amber-600 font-medium">
                      <Coins size={16} /> {p.price} tanga
                    </p>

                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex items-center gap-1 text-amber-600 hover:underline"
                      >
                        <Pencil size={16} /> Tahrirlash
                      </button>

                      <button
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center gap-1 text-red-500 hover:underline"
                      >
                        <Trash size={16} /> O&apos;chirish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
