import { DynamicIcon } from '../../lib/iconResolver';

export default function CategorySelector({ categories, onSelect, selectedId }) {
  if (!categories || categories.length === 0) {
    return <div className="p-10 text-center text-gray-500">No categories found in database.</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-[20px] font-bold text-[#333333] mb-6">Choose a Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedId === cat._id;
          
          return (
            <button
              key={cat._id}
              onClick={() => onSelect(cat._id)}
              className={`flex flex-col items-center justify-center p-6 border rounded-[8px] transition-all duration-300 hover:shadow-md ${
                isSelected 
                  ? 'border-[#046BD2] bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 bg-white hover:border-[#046BD2]'
              }`}
            >
              <div className={`mb-3 p-3 rounded-full ${isSelected ? 'bg-white' : 'bg-gray-50'}`}>
                <DynamicIcon name={cat.icon} size={28} className={isSelected ? "text-blue-600" : "text-gray-500"} />
              </div>
              <span className="text-[14px] font-medium text-center text-[#333333]">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
