"use client";

import { useState } from "react";
import api from "../../lib/axiosInstance";
import * as LucideIcons from "lucide-react";

export default function CategoryForm({ categories, onSuccess, selectedParentId = "" }) {
  const [formData, setFormData] = useState({
    name: "",
    parentId: selectedParentId,
    icon: "Tag",
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Flatten tree to get a list of un-ordered categories for parent dropdown
  const flattenCategories = (nodes, level = 0, result = []) => {
    nodes.forEach((node) => {
      result.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        flattenCategories(node.children, level + 1, result);
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories || []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Category name is required.");

    try {
      setLoading(true);
      setError("");
      
      const payload = {
        name: formData.name,
        icon: formData.icon,
        order: Number(formData.order) || 0,
        ...(formData.parentId ? { parentId: formData.parentId } : {}),
      };

      await api.post("/admin/categories", payload);
      
      setFormData({ name: "", parentId: "", icon: "Tag", order: 0 });
      if (onSuccess) onSuccess();
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Add New Category</h3>
      
      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Vehicles"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
           <select
             name="parentId"
             value={formData.parentId}
             onChange={handleChange}
             className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
           >
             <option value="">-- Root Level (No Parent) --</option>
             {flatCategories.map(cat => (
               <option key={cat._id} value={cat._id}>
                 {String.fromCharCode(160).repeat(cat.level * 4)}
                 {cat.level > 0 ? "└ " : ""}
                 {cat.name}
               </option>
             ))}
           </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lucide Icon Name</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="e.g. Tag, Car, Smartphone"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Check lucide.dev for names</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </form>
    </div>
  );
}
