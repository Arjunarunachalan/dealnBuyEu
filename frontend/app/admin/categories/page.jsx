"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../../lib/axiosInstance";
import CategoryTree from "../../../components/admin/CategoryTree";
import CategoryForm from "../../../components/admin/CategoryForm";
import AttributeForm from "../../../components/admin/AttributeForm";
import { CopyPlus, Network } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedId, setSelectedId] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectedCategory = useMemo(() => {
    if (!selectedId || categories.length === 0) return null;
    
    const findCat = (nodes, id) => {
      for (const n of nodes) {
        if (n._id === id) return n;
        if (n.children?.length > 0) {
          const found = findCat(n.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findCat(categories, selectedId);
  }, [categories, selectedId]);

  const handleSelectCategory = (category) => {
    setSelectedId(category._id);
  };

  const handleRefresh = () => {
    fetchCategories();
  };

  const isLeaf = selectedCategory && (!selectedCategory.children || selectedCategory.children.length === 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 inline-flex items-center gap-3">
             <Network className="text-blue-600" size={28}/> Category Management Engine
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
             Select nodes to inspect mappings, establish structural additions, or assign dynamic property strategies down to the leaf node schemas.
          </p>
        </div>
        
        {/* Deselect / Reset Context Button */}
        {selectedCategory && (
            <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 transition px-4 py-2 rounded-lg text-sm font-medium shadow-sm active:scale-95 border"
            >
                <CopyPlus size={16} /> New Root Class
            </button>
        )}
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {loading && categories.length === 0 ? (
        <div className="flex flex-col space-y-4 animate-pulse">
           <div className="h-48 bg-gray-200 rounded-xl w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full flex-1">
          {/* Left Panel: Scalable Vertical Hierarchy Tree */}
          <div className="lg:col-span-4 h-full">
            <CategoryTree
              categories={categories}
              onSelectCategory={handleSelectCategory}
              selectedId={selectedCategory?._id}
            />
          </div>

          {/* Right Panel: Contextual Operation Configuration Forms */}
          <div className="lg:col-span-8 h-full pb-10">
            {!selectedCategory ? (
              // Empty context: Add New Category form
              <div className="transition-all animate-in slide-in-from-bottom-2 duration-300">
                <CategoryForm
                   categories={categories}
                   onSuccess={handleRefresh}
                />
              </div>
            ) : isLeaf ? (
              // Selected Leaf: Show Attribute Schema Manager UI
              <div className="transition-all animate-in slide-in-from-bottom-2 duration-300">
                <AttributeForm
                   category={selectedCategory}
                   onSuccess={handleRefresh}
                />
              </div>
            ) : (
               // Selected Parent Node: Force child creation context under this branch
               <div className="transition-all animate-in slide-in-from-bottom-2 duration-300">
                 <div className="mb-4 p-4 border rounded-xl bg-blue-50/50 border-blue-100 flex items-start gap-3">
                    <Network className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Structural Node Access: {selectedCategory.name}</h4>
                      <p className="text-sm text-blue-700">You are viewing an active intermediate node. Dynamic attributes cannot be directly bound to structural containers. Proceed by building child endpoints off this branch below.</p>
                    </div>
                 </div>
                 <CategoryForm
                   categories={categories}
                   selectedParentId={selectedCategory._id}
                   onSuccess={handleRefresh}
                />
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
