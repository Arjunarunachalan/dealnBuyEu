'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Stepper from '../../components/postadd/Stepper';
import CategorySelector from '../../components/postadd/CategorySelector';
import SubcategorySelector from '../../components/postadd/SubcategorySelector';
import ProductDetailsForm from '../../components/postadd/ProductDetailsForm';

export default function AddPostPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/registration_login');
    }
  }, [router]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep(2);
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setCurrentStep(3);
  };

  const handleSubmit = (formData) => {
    console.log('Form Submitted:', formData);
    // In a real application, you would call an API here
    alert('Post created successfully!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sell Your Item</h1>
          <p className="text-gray-600">Fill in the details below to reach thousands of buyers</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Stepper currentStep={currentStep} />

          <div className="mt-8 transition-all duration-500 ease-in-out">
            {currentStep === 1 && (
              <CategorySelector 
                selectedId={selectedCategory} 
                onSelect={handleCategorySelect} 
              />
            )}

            {currentStep === 2 && (
              <SubcategorySelector 
                categoryId={selectedCategory} 
                onSelect={handleSubcategorySelect} 
                onBack={() => setCurrentStep(1)} 
              />
            )}

            {currentStep === 3 && (
              <ProductDetailsForm 
                subcategoryId={selectedSubcategory} 
                onBack={() => setCurrentStep(2)} 
                onSubmit={handleSubmit} 
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
