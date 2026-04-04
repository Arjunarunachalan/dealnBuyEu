"use client";

import CategoryNode from "./CategoryNode";
import { FolderTree } from "lucide-react";

export default function CategoryTree({ categories, onSelectCategory, selectedId }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-gray-50 border border-dashed rounded-xl">
        <FolderTree className="w-12 h-12 text-gray-300 mb-2" />
        <p>No categories exist yet.</p>
        <p className="text-sm">Add one from the panel on the right.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 h-[calc(100vh-140px)] overflow-y-auto w-full">
      <h3 className="text-sm font-black uppercase text-gray-400 tracking-wider mb-4 border-b pb-2">Category Structure Map</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <CategoryNode
            key={category._id}
            category={category}
            onSelect={onSelectCategory}
            selectedId={selectedId}
          />
        ))}
      </div>
    </div>
  );
}
