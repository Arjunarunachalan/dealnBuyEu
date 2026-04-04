import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function SubcategorySelector({ categories, categoryId, onSelect, onBack }) {
  const selectedCategory = categories.find(cat => cat._id === categoryId);
  const currentSubcategories = selectedCategory?.children || [];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-[20px] font-bold text-[#333333]">
          Select Subcategory {selectedCategory ? `for ${selectedCategory.name}` : ''}
        </h2>
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
            <div className="mt-4">
               <button 
                  onClick={() => onSelect(categoryId)}
                  className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                  Confirm and configure details
               </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {currentSubcategories.map((sub) => (
              <li key={sub._id}>
                <button
                  onClick={() => onSelect(sub._id)}
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
