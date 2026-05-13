'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Stepper from '../../components/postadd/Stepper';
import CategorySelector from '../../components/postadd/CategorySelector';
import SubcategorySelector from '../../components/postadd/SubcategorySelector';
import ProductDetailsForm from '../../components/postadd/ProductDetailsForm';
import api from '../../lib/axiosInstance';
import Modal from '../../components/ui/Modal';

import { useAuth } from '../../lib/useAuth';

export default function PostAddPage() {
  const { isChecking } = useAuth(true);
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState({
    categoryId: null,
    subcategoryId: null,
  });

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info', redirectUrl: null });

  // Edit mode state
  const [editPost, setEditPost] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  const isEditMode = !!editId;

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

  // Fetch post data when in edit mode
  useEffect(() => {
    if (!editId || loadingCats || categories.length === 0) return;

    const fetchPostForEdit = async () => {
      setLoadingEdit(true);
      try {
        const { data } = await api.get(`/posts/${editId}`);
        if (data?.success && data.data) {
          const post = data.data;
          setEditPost(post);

          // Find the category path to set selection
          const leafCatId = post.categoryId?._id || post.categoryId;
          
          // Find root category by traversing categoryPath or tree
          let rootCatId = null;
          const findRoot = (nodes, targetId) => {
            for (const node of nodes) {
              if (node._id === targetId) return node._id;
              if (node.children?.length > 0) {
                const found = findInChildren(node.children, targetId);
                if (found) return node._id;
              }
            }
            return null;
          };

          const findInChildren = (nodes, targetId) => {
            for (const node of nodes) {
              if (node._id === targetId) return true;
              if (node.children?.length > 0 && findInChildren(node.children, targetId)) return true;
            }
            return false;
          };

          rootCatId = findRoot(categories, leafCatId);

          setSelection({
            categoryId: rootCatId || leafCatId,
            subcategoryId: leafCatId,
          });

          // Skip to step 3 (product details) in edit mode
          setStep(3);
        }
      } catch (err) {
        console.error('Failed to fetch post for editing:', err);
        setModalState({ isOpen: true, title: 'Error', message: 'Failed to load post data for editing.', type: 'error' });
      } finally {
        setLoadingEdit(false);
      }
    };

    fetchPostForEdit();
  }, [editId, loadingCats, categories]);

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
      
      if (typeof data.location === 'object' && data.location.lat != null && data.location.lng != null) {
        locationData.geo = {
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat]
        };
      }

      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        location: locationData,
        images: data.images,
        attributes: {},
      };

      // Everything else in data is an attribute
      Object.keys(data).forEach(key => {
         if (!['title', 'description', 'price', 'location', 'images'].includes(key)) {
            payload.attributes[key] = data[key];
         }
      });

      if (isEditMode) {
        // Update existing post
        await api.put(`/posts/${editId}`, payload);
        setModalState({ isOpen: true, title: 'Updated!', message: 'Your ad has been updated successfully.', type: 'success', redirectUrl: `/myads` });
      } else {
        // Create new post
        payload.categoryId = selection.subcategoryId;
        await api.post('/posts', payload);
        
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
      }
    } catch (err) {
      console.error(err);
      setModalState({ isOpen: true, title: 'Error', message: err?.response?.data?.message || 'Failed to submit post.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking || loadingEdit) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[#333333]">{isEditMode ? 'Edit Your Ad' : 'Sell Your Item'}</h1>
          <p className="text-gray-500 mt-2">
            {isEditMode ? 'Update the details of your listing' : 'Follow the steps to list your product for free'}
          </p>
        </div>

        {!isEditMode && <Stepper currentStep={step} />}

        <div className="mt-8">
          {loadingCats ? (
            <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>
          ) : (
            <>
              {step === 1 && !isEditMode && (
                <CategorySelector 
                  categories={categories}
                  onSelect={handleCategorySelect} 
                  selectedId={selection.categoryId} 
                />
              )}

              {step === 2 && !isEditMode && (
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
                  onBack={isEditMode ? null : handleBackToSubcategories}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                  isEditMode={isEditMode}
                  initialData={editPost}
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
