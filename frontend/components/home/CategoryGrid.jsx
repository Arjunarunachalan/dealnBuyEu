import { Car, Bike, Smartphone, Monitor, Home, Sofa, Briefcase, PlusCircle } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { id: 1, name: 'Cars', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Bikes', icon: Bike, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 3, name: 'Mobiles', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 4, name: 'Electronics', icon: Monitor, color: 'text-teal-500', bg: 'bg-teal-50' },
  { id: 5, name: 'Properties', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 6, name: 'Furniture', icon: Sofa, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 7, name: 'Jobs', icon: Briefcase, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 8, name: 'View All', icon: PlusCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
];

export default function CategoryGrid() {
  console.log('CategoryGrid loaded');
  return (
    <section className="py-8 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 px-2">Popular  Categories</h2>
        
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 px-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const targetUrl = cat.name === 'View All' ? '/categories' : `/category/${cat.name.toLowerCase()}`;
            
            return (
              <Link 
                key={cat.id} 
                href={targetUrl}
                className="flex flex-col items-center justify-center group"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ${cat.bg} mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-black/5`}>
                  <Icon size={32} className={`${cat.color} group-hover:scale-110 transition-transform duration-300`} />
                </div>
                <span className="text-[13px] md:text-[14px] font-medium text-gray-700 text-center leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
