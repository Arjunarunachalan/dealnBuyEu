"use client";

import { useState, useEffect } from "react";
import api from "../../lib/axiosInstance";
import { Plus, Trash2, Save, DatabaseZap } from "lucide-react";

export default function AttributeForm({ category, onSuccess }) {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fieldTypes = ["text", "number", "select", "radio", "checkbox", "boolean"];

  useEffect(() => {
    // Populate form with existing attributes initially 
    if (category) {
      const formatted = (category.attributes || []).map(a => ({
         ...a,
         optionsString: a.options && Array.isArray(a.options) ? a.options.join(", ") : ""
      }));
      setAttributes(formatted);
      setError("");
      setSuccessMsg("");
    }
  }, [category]);

  const handleAddAttribute = () => {
    setAttributes([
      ...attributes,
      {
        key: "",
        label: "",
        type: "text",
        optionsString: "",
        required: false,
        filterable: false,
      },
    ]);
  };

  const handleRemoveAttribute = (index) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    
    // Automatically reset options if type changes away from select/radio/checkbox
    if (field === 'type' && !['select', 'radio', 'checkbox'].includes(value)) {
       updated[index].optionsString = "";
    }

    setAttributes(updated);
  };

  const handleOptionsChange = (index, value) => {
    const updated = [...attributes];
    updated[index].optionsString = value;
    setAttributes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || category.children?.length > 0) return;

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const formattedAttributes = attributes.map(attr => {
        const optionsArr = attr.optionsString ? attr.optionsString.split(",").map(opt => opt.trim()).filter(opt => opt !== "") : [];
        return { ...attr, options: optionsArr };
      });

      // Validate inputs
      for (const attr of formattedAttributes) {
        if (!attr.key || !attr.label) {
          throw new Error("All attributes must have a unique Key and Label.");
        }
        if (["select", "radio", "checkbox"].includes(attr.type) && attr.options.length === 0) {
          throw new Error(`Attribute '${attr.label}' of type ${attr.type} requires at least one option.`);
        }
      }

      await api.put(`/admin/categories/${category._id}/attributes`, {
        attributes: formattedAttributes,
      });

      setSuccessMsg("Attributes successfully saved!");
      if (onSuccess) onSuccess();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update attributes");
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center text-center justify-center min-h-[300px]">
         <DatabaseZap className="w-12 h-12 text-gray-300 mb-4" />
         <h3 className="text-xl font-medium text-gray-600">Select a Leaf Category</h3>
         <p className="text-gray-400 mt-2 text-sm max-w-sm">
           Attributes can only be appended strictly to the deepest nodes within the hierarchy.
         </p>
      </div>
    );
  }

  // Double check if its leaf
  if (category.children && category.children.length > 0) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm border-amber-200">
        <h3 className="text-lg font-bold text-amber-800 border-b border-amber-100 pb-2 mb-4">
          Non-Leaf Category Selected
        </h3>
        <p className="text-sm text-gray-700">
          The category <strong>"{category.name}"</strong> has children. Dynamic attributes can only be configured on final leaf nodes (a category that has zero child categories) so please select a final node below this one to manage attributes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm font-sans flex flex-col h-[calc(100vh-140px)]">
      {/* Sticky Header */}
      <div className="p-6 border-b shrink-0 bg-gray-50 rounded-t-xl z-10 box-border sticky top-0">
        <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">
                Attributes: <span className="text-blue-600 font-medium">{category.name}</span>
              </h3>
              <p className="text-sm text-gray-500 mt-1">Configure dynamic listing fields accurately mapped to this leaf category.</p>
            </div>
            
            <button
                type="button"
                onClick={handleAddAttribute}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 transition text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm active:scale-95"
            >
                <Plus size={16} /> Add Field
            </button>
        </div>

        {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200 shadow-sm mt-3 animate-pulse">
            {error}
            </div>
        )}
        {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-200 shadow-sm mt-3">
            {successMsg}
            </div>
        )}
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto w-full box-border">
          <form id="attributeForm" onSubmit={handleSubmit} className="p-6 w-full space-y-6">
            {attributes.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-xl border border-dashed">
                <p>No attributes configured yet.</p>
                <button
                  type="button"
                  onClick={handleAddAttribute} 
                  className="mt-4 text-blue-600 font-medium underline hover:text-blue-800"
                >
                  Start creating dynamically strict properties right now
                </button>
              </div>
            ) : (
              attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-12 gap-x-4 gap-y-5 items-start p-6 bg-gray-50/70 border rounded-xl shadow-sm relative group w-full transition-colors hover:bg-gray-50/90 box-border">
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(index)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-80"
                    title="Remove Attribute"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="col-span-12 sm:col-span-5 relative w-full pr-8">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Key (Internal) *</label>
                    <input
                      type="text"
                      pattern="^[a-zA-Z0-9_]+$"
                      title="Only letters, numbers, and underscores."
                      placeholder="e.g. engine_capacity"
                      value={attr.key}
                      onChange={(e) => handleChange(index, "key", e.target.value)}
                      className="w-full bg-white p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                    <p className="text-[11px] text-gray-400 mt-1 pl-1">Strict alphanumeric database key</p>
                  </div>

                  <div className="col-span-12 sm:col-span-4 relative w-full pr-8">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Label (Display) *</label>
                    <input
                      type="text"
                      placeholder="e.g. Engine Capacity (cc)"
                      value={attr.label}
                      onChange={(e) => handleChange(index, "label", e.target.value)}
                      className="w-full bg-white p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-3 w-full pr-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Input Type *</label>
                    <select
                      value={attr.type}
                      onChange={(e) => handleChange(index, "type", e.target.value)}
                      className="w-full bg-white p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {["select", "radio", "checkbox"].includes(attr.type) && (
                    <div className="col-span-12 w-full mt-2 pr-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Options (Comma separated) *</label>
                        <input
                            type="text"
                            placeholder="e.g. Automatic, Manual, CVT"
                            value={attr.optionsString || ""}
                            onChange={(e) => handleOptionsChange(index, e.target.value)}
                            className="w-full bg-white p-2.5 text-sm border border-gray-300 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                  )}

                  <div className="col-span-12 flex flex-wrap gap-6 items-center w-full bg-white p-3 rounded-lg border shadow-sm border-gray-200 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group/chk">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={attr.required}
                                onChange={(e) => handleChange(index, "required", e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded bg-gray-50 border-gray-300 focus:ring-blue-500 cursor-pointer shadow-sm transition-all"
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover/chk:text-gray-900 select-none">Mandatory Field</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group/chk">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={attr.filterable}
                                onChange={(e) => handleChange(index, "filterable", e.target.checked)}
                                className="w-5 h-5 text-emerald-600 rounded bg-gray-50 border-gray-300 focus:ring-emerald-500 cursor-pointer shadow-sm transition-all"
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover/chk:text-gray-900 select-none">Show in Search Filters</span>
                    </label>
                  </div>

                </div>
              ))
            )}
          </form>
      </div>
      
      {/* Sticky Footer */}
      {attributes.length > 0 && (
          <div className="p-4 border-t bg-gray-50 shrink-0 sticky bottom-0 z-10 w-full flex justify-end box-border">
            <button
              type="submit"
              form="attributeForm"
              disabled={loading}
              className="flex items-center gap-2 justify-center w-full sm:w-auto min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Save size={18} /> {loading ? "Saving Persistence..." : "Save Schema Strategy"}
            </button>
          </div>
      )}
    </div>
  );
}
