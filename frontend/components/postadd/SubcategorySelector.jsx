import { subcategories } from '../../lib/dummyCategories';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function SubcategorySelector({ categoryId, onSelect, onBack }) {
  const currentSubcategories = subcategories[categoryId] || [];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-[20px] font-bold text-[#333333]">Select Subcategory</h2>
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#046BD2] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Categories
        </button>
      </div>

      <div className="bg-white rounded-[8px] border border-gray-200 overflow-hidden shadow-sm">
        {currentSubcategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No subcategories found for this selection.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {currentSubcategories.map((sub) => (
              <li key={sub.id}>
                <button
                  onClick={() => onSelect(sub.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-[15px] text-[#333333] group-hover:text-[#046BD2] font-medium transition-colors">
                    {sub.name}
                  </span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-[#046BD2] transition-transform group-hover:translate-x-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
