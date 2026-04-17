'use client';

import { useState } from 'react';
import { dummyDynamicFieldsOptions } from '../../lib/dummyCategories';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ImagePlus, MapPin, Tag } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import LocationInput from './LocationInput';

export default function ProductDetailsForm({ categories, subcategoryId, onBack, onSubmit }) {
  const { user } = useAuthStore();
  
  // Recursively find the selected leaf category to get its dynamic attributes
  const dynamicFields = (() => {
    let result = null;
    const findCat = (nodes) => {
      for (const node of nodes) {
        if (node._id === subcategoryId) {
          result = node;
          return;
        }
        if (node.children?.length > 0) findCat(node.children);
      }
    };
    if (categories?.length) findCat(categories);
    return result?.attributes || [];
  })();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    ...dynamicFields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {}) // Note: field.key used instead of field.id to match actual attribute payload
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    // using name for radio/checkbox, id for others generally
    const key = e.target.name || e.target.id;
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const base64Promises = files.map(file => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }));
      const base64Images = await Promise.all(base64Promises);
      setImages((prev) => [...prev, ...base64Images].slice(0, 5)); // Limit to 5
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, images });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-[#333333]">Post Details</h2>
        <button 
          onClick={onBack}
          className="text-sm font-medium text-gray-500 hover:text-[#046BD2] transition-colors"
        >
          Change Subcategory
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* Core Details Panel */}
        <div className="bg-white p-6 rounded-[8px] border border-gray-200 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#333333] border-b pb-3 mb-5 flex items-center gap-2">
            <Tag size={18} className="text-[#046BD2]" /> Key Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input 
                id="title"
                label="Ad Title"
                placeholder="Mention the key features of your item (e.g. brand, model, age, type)"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={70}
              />
              <p className="text-[12px] text-gray-400 mt-1 text-right">{formData.title.length} / 70</p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-[12px] font-normal text-[#333333] mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows="4"
                className="w-full p-4 bg-[#EBEBEB] border-[0.8px] border-[rgba(149,149,149,0.52)] rounded-[5px] text-[14px] text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#046BD2] focus:border-[#046BD2] transition-colors resize-none"
                placeholder="Include condition, features and reason for selling"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={4000}
              />
              <p className="text-[12px] text-gray-400 mt-1 text-right">{formData.description.length} / 4000</p>
            </div>
          </div>
        </div>

        {/* Dynamic Fields Panel */}
        {dynamicFields.length > 0 && (
          <div className="bg-white p-6 rounded-[8px] border border-gray-200 shadow-sm">
            <h3 className="text-[16px] font-semibold text-[#333333] border-b pb-3 mb-5">
              Specifics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dynamicFields.map(field => (
                <div key={field.key} className="w-full">
                  <label htmlFor={field.key} className="block text-[12px] font-normal text-[#333333] mb-2">
                    {field.label} {field.required && '*'}
                  </label>
                  
                  {field.type === 'select' && (
                    <select
                      id={field.key}
                      name={field.key}
                      className="w-full h-[48px] px-4 bg-[#EBEBEB] border-[0.8px] border-[rgba(149,149,149,0.52)] rounded-[5px] text-[14px] text-[#333333] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#046BD2] transition-colors"
                      value={formData[field.key] || ''}
                      onChange={handleChange}
                      required={field.required}
                    >
                      <option value="">Select an option</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'radio' && (
                    <div className="flex flex-wrap gap-3">
                      {field.options.map(opt => {
                        const isSelected = formData[field.key] === opt;
                        return (
                          <label 
                             key={opt} 
                             className={`relative flex items-center justify-center cursor-pointer border-2 rounded-lg py-2.5 px-5 font-medium text-[14px] transition-all duration-200 shadow-sm
                             ${isSelected 
                               ? 'bg-blue-50 border-[#046BD2] text-[#046BD2] ring-2 ring-blue-100' 
                               : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                           >
                            <input 
                              type="radio" 
                              name={field.key} 
                              id={`${field.key}-${opt}`}
                              value={opt} 
                              checked={isSelected}
                              onChange={handleChange}
                              className="sr-only" // screen reader only to keep accessibility while hiding the ugly default dot
                            />
                            <span>{opt}</span>
                            {isSelected && (
                              <svg className="absolute -top-2 -right-2 w-5 h-5 bg-[#046BD2] text-white rounded-full p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {field.type === 'number' && (
                    <Input 
                      id={field.key}
                      name={field.key}
                      type="number"
                      placeholder={`Enter ${field.label}`}
                      value={formData[field.key] || ''}
                      onChange={handleChange}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price & Location Panel */}
        <div className="bg-white p-6 rounded-[8px] border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[16px] font-semibold text-[#333333] border-b pb-3 mb-5">
                Set a Price
              </h3>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium pb-2">€</span>
                <Input 
                  id="price"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-[16px] font-semibold text-[#333333] border-b pb-3 mb-5 flex items-center gap-2">
                <MapPin size={18} className="text-[#046BD2]" /> Confirm your location
              </h3>
              <LocationInput 
                id="location"
                placeholder="City, Neighborhood or Zip"
                value={formData.location}
                onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                countryCode={user?.country}
                required
              />
            </div>
          </div>
        </div>

        {/* Image Upload Panel */}
        <div className="bg-white p-6 rounded-[8px] border border-gray-200 shadow-sm">
          <h3 className="text-[16px] font-semibold text-[#333333] border-b pb-3 mb-5">
            Upload up to 5 photos
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {images.map((src, index) => (
              <div key={index} className="aspect-square relative rounded-[8px] border border-gray-200 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-[8px] cursor-pointer hover:bg-gray-50 hover:border-[#046BD2] transition-colors">
                <ImagePlus size={28} className="text-gray-400 mb-2" />
                <span className="text-xs text-center text-gray-500 font-medium px-2">Add Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" className="w-full md:w-auto px-10">
            Post Now
          </Button>
        </div>
      </form>
    </div>
  );
}
