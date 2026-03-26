'use client';

import Link from 'next/link';
import { Car, Bike, Smartphone, Monitor, Home, Sofa, Briefcase, PlusCircle, Gamepad2, Shirt, Book, Utensils, HeartPulse, Camera, Music, Wrench } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

// A more extensive list for the All Categories page
const allCategories = [
  { id: 1, name: 'Cars', icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Bikes', icon: Bike, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 3, name: 'Mobiles', icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 4, name: 'Electronics', icon: Monitor, color: 'text-teal-500', bg: 'bg-teal-50' },
  { id: 5, name: 'Properties', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 6, name: 'Furniture', icon: Sofa, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 7, name: 'Jobs', icon: Briefcase, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: 8, name: 'Gaming', icon: Gamepad2, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 9, name: 'Fashion', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 10, name: 'Books', icon: Book, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 11, name: 'Appliances', icon: Utensils, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 12, name: 'Health', icon: HeartPulse, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 13, name: 'Cameras', icon: Camera, color: 'text-gray-800', bg: 'bg-gray-100' },
  { id: 14, name: 'Music', icon: Music, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 15, name: 'Tools', icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-100' },
  { id: 16, name: 'Other', icon: PlusCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
];

export default function AllCategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-1">
          <Link href="/" className="hover:text-[#046BD2]">Home</Link> <span>/</span> 
          <span className="text-gray-900 font-medium truncate">All Categories</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">Browse All Categories</h1>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
            {allCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.name.toLowerCase()}`}
                  className="flex flex-col items-center justify-center group"
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${cat.bg} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-black/5`}>
                    <Icon size={40} className={`${cat.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <span className="text-[15px] font-bold text-gray-800 text-center leading-tight group-hover:text-[#046BD2] transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
