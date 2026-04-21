'use client';

import { useState, useEffect } from 'react';
import Stepper from '../../components/postadd/Stepper';
import CategorySelector from '../../components/postadd/CategorySelector';
import SubcategorySelector from '../../components/postadd/SubcategorySelector';
import ProductDetailsForm from '../../components/postadd/ProductDetailsForm';
import api from '../../lib/axiosInstance';
import Modal from '../../components/ui/Modal';

import { useAuth } from '../../lib/useAuth';

export default function PostAddPage() {
  const { isChecking } = useAuth(true);
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    categoryId: null,
    subcategoryId: null, // this will be the ID of the leaf category
  });

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectUrl: null });

  const closeModal = () => {
    const url = modalState.redirectUrl;
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (url) {
      window.location.href = url;
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data?.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

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

  const handleFinalSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const locationData = {
        city: typeof data.location === 'object' ? data.location.address : data.location
      };
      
      // Map GPS coordinates natively into GeoJSON format required by 2dsphere backend index
      if (typeof data.location === 'object' && data.location.lat != null && data.location.lng != null) {
        locationData.geo = {
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat] // Spec requires [longitude, latitude]
        };
      }

      // Structure payload for the backend specifically
      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        location: locationData,
        images: data.images,
        categoryId: selection.subcategoryId, // The final leaf node we are posting in
        attributes: {} // populate explicit dynamic attributes
      };

      // Everything else in data is an attribute
      Object.keys(data).forEach(key => {
         if (!['title', 'description', 'price', 'location', 'images'].includes(key)) {
            payload.attributes[key] = data[key];
         }
      });

      const res = await api.post('/posts', payload);
      
      // Calculate slug for redirect
      let slug = '';
      const traverse = (nodes) => {
         for (let n of nodes) {
            if (n._id === selection.subcategoryId) slug = n.slug;
            if (n.children && !slug) traverse(n.children);
         }
      };
      if (categories) traverse(categories);
      
      const redirectUrl = slug ? `/category/${slug}` : '/';
      setModalState({ isOpen: true, title: 'Success', message: 'Post submitted successfully!', type: 'success', redirectUrl });
    } catch (err) {
      console.error(err);
      setModalState({ isOpen: true, title: 'Error', message: err?.response?.data?.message || 'Failed to submit post.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
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
          {loadingCats ? (
            <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
          ) : (
            <>
              {step === 1 && (
                <CategorySelector 
                  categories={categories}
                  onSelect={handleCategorySelect} 
                  selectedId={selection.categoryId} 
                />
              )}

              {step === 2 && (
                <SubcategorySelector 
                  categories={categories}
                  categoryId={selection.categoryId}
                  onSelect={handleSubcategorySelect}
                  onBack={handleBackToCategories}
                />
              )}

              {step === 3 && (
                <ProductDetailsForm 
                  categories={categories}
                  subcategoryId={selection.subcategoryId}
                  onBack={handleBackToSubcategories}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Modal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={closeModal}
      />
    </main>
  );
}
