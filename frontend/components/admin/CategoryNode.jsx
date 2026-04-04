"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { ChevronRight, ChevronDown } from "lucide-react";

export default function CategoryNode({ category, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(false);
  
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category._id;

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const IconComponent = LucideIcons[category.icon] || LucideIcons.Tag;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors ${
          isSelected ? "bg-blue-50 text-blue-700 font-medium border border-blue-100" : "hover:bg-gray-50 text-gray-700"
        }`}
        onClick={() => onSelect(category)}
      >
        {/* Expand/Collapse Caret */}
        <div className="w-5 flex justify-center" onClick={hasChildren ? handleToggle : undefined}>
          {hasChildren ? (
            expanded ? (
              <ChevronDown size={16} className="text-gray-400 hover:text-gray-800" />
            ) : (
              <ChevronRight size={16} className="text-gray-400 hover:text-gray-800" />
            )
          ) : (
            <div className="w-4 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-sm ml-2 mt-[-5px]" />
          )}
        </div>

        {/* Dynamic Icon */}
        <IconComponent size={16} className={isSelected ? "text-blue-600" : "text-gray-400"} />

        {/* Name */}
        <span className="text-sm">{category.name}</span>
        
        {/* Leaf indicator */}
        {!hasChildren && (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm font-semibold ml-auto tracking-wide uppercase shadow-sm">
            Leaf Node
          </span>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="pl-6 ml-2 border-l border-gray-100 mt-1 space-y-1">
          {category.children.map((child) => (
            <CategoryNode
              key={child._id}
              category={child}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
