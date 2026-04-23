"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";

export default function LegalPagesAdmin() {
  const [activePage, setActivePage] = useState("privacy");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  const { accessToken } = useAuthStore();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const { data } = await axios.get(`${API_URL}/legal-pages/${activePage}`);
      if (data && data.title) {
        setTitle(data.title);
        setSections(data.sections || []);
      } else {
        // Defaults if page doesn't exist yet
        setTitle(
          activePage === "privacy"
            ? "Privacy Policy"
            : activePage === "terms"
            ? "Terms & Conditions"
            : "Cookies & Tracking Policy"
        );
        setSections([]);
      }
    } catch (error) {
      console.error("Error fetching legal page:", error);
      setMessage({ type: "error", text: "Failed to load page data." });
    } finally {
      setLoading(false);
    }
  }, [activePage, API_URL]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.put(
        `${API_URL}/legal-pages/${activePage}`,
        { title, sections },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMessage({ type: "success", text: "Page updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving legal page:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save page data.",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSection = () => {
    setSections([...sections, { title: "", content: "", points: [] }]);
  };

  const removeSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const addPoint = (sectionIndex) => {
    const newSections = [...sections];
    if (!newSections[sectionIndex].points) newSections[sectionIndex].points = [];
    newSections[sectionIndex].points.push("");
    setSections(newSections);
  };

  const removePoint = (sectionIndex, pointIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].points.splice(pointIndex, 1);
    setSections(newSections);
  };

  const updatePoint = (sectionIndex, pointIndex, value) => {
    const newSections = [...sections];
    newSections[sectionIndex].points[pointIndex] = value;
    setSections(newSections);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Legal Pages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage content for policies and terms</p>
        </div>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {["privacy", "terms", "cookies"].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                activePage === page
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {page === "terms" ? "Terms & Conditions" : `${page} Policy`}
            </button>
          ))}
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. Privacy Policy"
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Sections</h2>
              <button
                onClick={addSection}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus size={16} /> Add Section
              </button>
            </div>

            {sections.length === 0 ? (
              <p className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                No sections added yet. Click "Add Section" to begin.
              </p>
            ) : (
              sections.map((section, sIndex) => (
                <div key={sIndex} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-4">
                  <div className="flex justify-between gap-4 items-start">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(sIndex, "title", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          placeholder="e.g. 1. Introduction"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          Paragraph Content
                        </label>
                        <textarea
                          value={section.content}
                          onChange={(e) => updateSection(sIndex, "content", e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white resize-y"
                          placeholder="Main paragraph text..."
                        />
                      </div>

                      {/* Points Area */}
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bullet Points (Optional)
                          </label>
                          <button
                            onClick={() => addPoint(sIndex)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Plus size={14} /> Add Point
                          </button>
                        </div>
                        
                        {section.points && section.points.length > 0 ? (
                          <div className="space-y-2">
                            {section.points.map((point, pIndex) => (
                              <div key={pIndex} className="flex gap-2 items-start">
                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                                <input
                                  type="text"
                                  value={point}
                                  onChange={(e) => updatePoint(sIndex, pIndex, e.target.value)}
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                  placeholder="Bullet point text..."
                                />
                                <button
                                  onClick={() => removePoint(sIndex, pIndex)}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5"
                                  title="Remove point"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No bullet points added.</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeSection(sIndex)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove section"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
