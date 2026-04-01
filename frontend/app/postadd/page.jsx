'use client';

import { useState } from 'react';
import Stepper from '../../components/postadd/Stepper';
import CategorySelector from '../../components/postadd/CategorySelector';
import SubcategorySelector from '../../components/postadd/SubcategorySelector';
import ProductDetailsForm from '../../components/postadd/ProductDetailsForm';

import { useAuth } from '../../lib/useAuth';

export default function PostAddPage() {
  const { isChecking } = useAuth(true);
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    categoryId: null,
    subcategoryId: null,
  });

  const handleCategorySelect = (id) => {
    setSelection({ ...selection, categoryId: id });
    setStep(2);
  };

  const handleSubcategorySelect = (id) => {
    setSelection({ ...selection, subcategoryId: id });
    setStep(3);
  };

  const handleBackToCategories = () => {
    setStep(1);
  };

  const handleBackToSubcategories = () => {
    setStep(2);
  };

  const handleFinalSubmit = (data) => {
    console.log('Final Post Data:', { ...selection, ...data });
    alert('Post submitted successfully (Dummy)! Check console for data.');
    // In a real app, you'd route to the newly created post or home
  };

  if (isChecking) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#333333]">Sell Your Item</h1>
          <p className="text-gray-500 mt-2">Follow the steps to list your product for free</p>
        </div>

        <Stepper currentStep={step} />

        <div className="mt-8">
          {step === 1 && (
            <CategorySelector 
              onSelect={handleCategorySelect} 
              selectedId={selection.categoryId} 
            />
          )}

          {step === 2 && (
            <SubcategorySelector 
              categoryId={selection.categoryId}
              onSelect={handleSubcategorySelect}
              onBack={handleBackToCategories}
            />
          )}

          {step === 3 && (
            <ProductDetailsForm 
              subcategoryId={selection.subcategoryId}
              onBack={handleBackToSubcategories}
              onSubmit={handleFinalSubmit}
            />
          )}
        </div>
      </div>
    </main>
  );
}
