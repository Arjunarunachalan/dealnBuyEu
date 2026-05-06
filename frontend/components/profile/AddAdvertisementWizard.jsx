'use client';

import React, { useState, useEffect } from 'react';
import { 
  Check, ChevronRight, UploadCloud, MapPin, Target, Eye, AlertCircle, 
  Search, Layout, ShoppingBag, CreditCard, Play, Calculator, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddAdvertisementWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    images: [],
    city: '',
    radius: 10,
    placement: 'search', // search, homepage, product
    cpmModel: true,
    budget: 5,
    days: 7,
  });

  const placementMultipliers = {
    search: 1.0,
    homepage: 1.5,
    product: 1.2,
  };

  const placementInfo = {
    search: { label: 'Search Results', desc: 'Show in top of search', vis: 'High' },
    homepage: { label: 'Homepage', desc: 'Featured on main page', vis: 'Medium' },
    product: { label: 'Product Detail Page', desc: 'Under related items', vis: 'Medium' }
  };

  // Calculations
  const baseCPM = 3;
  const multiplier = placementMultipliers[formData.placement] || 1;
  const finalCPM = baseCPM * multiplier;
  const totalCost = formData.budget * formData.days;
  const estimatedImpressions = Math.floor((totalCost / finalCPM) * 1000);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.url || formData.images.length === 0) {
        toast.error("Please fill in all required fields and upload an image.");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.city) {
        toast.error("Please select a city.");
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }
    
    // Create object URLs for preview
    const newImages = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...formData.images, ...newImages] });
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const submitCampaign = () => {
    if (formData.budget < 5) {
      toast.error("Minimum daily budget is €5");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Campaign launched successfully!");
      // Reset or redirect here
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-10 relative overflow-hidden min-h-[600px] flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#046BD2] to-[#035bb3]"></div>
      
      {/* Header & Progress Indicator */}
      <div className="mb-8 border-b border-gray-100 pb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Create Advertisement</h2>
        
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#046BD2] rounded-full z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          ></div>
          
          {[1, 2, 3].map((step) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${currentStep > step ? 'bg-[#046BD2] text-white' : 
                    currentStep === step ? 'bg-[#046BD2] text-white shadow-[0_0_0_4px_rgba(4,107,210,0.2)]' : 
                    'bg-white text-gray-400 border-2 border-gray-200'}`}
              >
                {currentStep > step ? <Check size={18} /> : step}
              </div>
              <span className={`absolute -bottom-6 w-32 text-center text-xs font-semibold
                ${currentStep >= step ? 'text-gray-900' : 'text-gray-400'}`}>
                {step === 1 ? 'Ad Details' : step === 2 ? 'Targeting & Delivery' : 'Budget & Payment'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-8">
        {/* Main Form Area */}
        <div className="flex-1 space-y-6">
          
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Layout className="mr-2 text-[#046BD2]" size={20} /> Ad Details
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter ad title"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#046BD2] focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> Mention key features (Brand, Model, Type, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Description <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                  </label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your service or offer"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#046BD2] focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Redirection URL <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="url" 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#046BD2] focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> Users will be redirected to this link
                  </p>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Images <span className="text-red-500">*</span> <span className="text-gray-400 normal-case font-normal text-xs">(Max 3)</span>
                  </label>
                  
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all group relative">
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#046BD2] transition-colors" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#046BD2] hover:text-[#035bb3] focus-within:outline-none px-2 py-0.5 shadow-sm border border-gray-200">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  
                  {/* Image Previews */}
                  {formData.images.length > 0 && (
                    <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 group">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <AlertCircle size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="mr-2 text-[#046BD2]" size={20} /> Targeting & Delivery
              </h3>
              
              <div className="space-y-8">
                {/* Section A: Location Targeting */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide mb-4">Location Targeting</h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">City Selection <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder="e.g. Paris, Lyon, Marseille"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2] outline-none shadow-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Radius Selection</label>
                      <div className="flex flex-wrap gap-3">
                        {[5, 10, 25, 50].map((km) => (
                          <button
                            key={km}
                            onClick={() => setFormData({...formData, radius: km})}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border ${
                              formData.radius === km 
                                ? 'bg-[#046BD2] text-white border-[#046BD2] shadow-md shadow-blue-500/20' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {km} km
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 flex items-start">
                      <AlertCircle className="text-[#046BD2] mt-0.5 mr-2 flex-shrink-0" size={16} />
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Your ads will only be shown within France, even if the selected radius overlaps other countries.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section B: Ad Placement */}
                <div>
                  <h4 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide mb-4">Ad Placement</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Object.entries(placementInfo).map(([key, info]) => {
                      const isSelected = formData.placement === key;
                      const Icon = key === 'search' ? Search : key === 'homepage' ? Layout : ShoppingBag;
                      return (
                        <div 
                          key={key}
                          onClick={() => setFormData({...formData, placement: key})}
                          className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-[#046BD2] bg-blue-50/30 shadow-sm' 
                              : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                          }`}
                        >
                          {key === 'search' && (
                            <div className="absolute -top-2.5 -right-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                              Recommended
                            </div>
                          )}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isSelected ? 'bg-[#046BD2] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon size={18} />
                          </div>
                          <h5 className="font-bold text-gray-900 text-sm mb-1">{info.label}</h5>
                          <p className="text-xs text-gray-500 mb-3">{info.desc}</p>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <Eye size={12} className="mr-1" /> Visibility: 
                            <span className={`ml-1 ${info.vis === 'High' ? 'text-green-600' : 'text-orange-500'}`}>{info.vis}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Section C: Estimated Impressions */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-indigo-900 flex items-center">
                      <Target size={16} className="mr-2" /> Estimated Reach
                    </h5>
                    <p className="text-indigo-700 font-extrabold text-2xl mt-1">
                      {formData.city ? `${Math.max(500, formData.radius * 120).toLocaleString()} - ${Math.max(1000, formData.radius * 250).toLocaleString()}` : '0'} 
                      <span className="text-sm font-semibold ml-1">daily impressions</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-indigo-50 group relative">
                    <HelpCircle className="text-indigo-300" size={24} />
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                      Estimates are based on current platform traffic and selected radius.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <CreditCard className="mr-2 text-[#046BD2]" size={20} /> Budget & Payment
              </h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide">Pricing Model</h4>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
                      CPM Mode
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-200 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Base CPM</p>
                      <p className="font-extrabold text-gray-900">€{baseCPM}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Multiplier</p>
                      <p className="font-extrabold text-[#046BD2]">{multiplier}x</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Final CPM</p>
                      <p className="font-extrabold text-green-600">€{finalCPM.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">Cost Per Mille (1,000 impressions) based on {placementInfo[formData.placement].label}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Daily Budget <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">€</span>
                      <input 
                        type="number" 
                        min="5"
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: Math.max(0, parseInt(e.target.value) || 0)})}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2] outline-none shadow-sm font-semibold text-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Minimum €5/day</p>
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Duration (Days) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      value={formData.days}
                      onChange={(e) => setFormData({...formData, days: Math.max(1, parseInt(e.target.value) || 1)})}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-[#046BD2] focus:ring-1 focus:ring-[#046BD2] outline-none shadow-sm font-semibold text-lg"
                    />
                  </div>
                </div>

                {/* Real-time Calculation */}
                <div className="bg-[#046BD2] text-white p-5 rounded-2xl shadow-md flex items-center justify-between mt-4">
                  <div>
                    <h5 className="font-bold flex items-center text-blue-100 text-sm mb-1">
                      <Calculator size={16} className="mr-2" /> Total Campaign Cost
                    </h5>
                    <p className="font-extrabold text-3xl">€{totalCost.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Est. Impressions</p>
                    <p className="font-bold text-xl">{estimatedImpressions.toLocaleString()}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Sticky Sidebar Summary */}
        {currentStep > 1 && (
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-6 bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 p-5 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>
              
              <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase text-sm tracking-wider">Campaign Summary</h4>
              
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Ad Title</p>
                  <p className="font-semibold text-gray-900 truncate">{formData.title || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Location & Radius</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <MapPin size={14} className="mr-1 text-[#046BD2]" /> 
                    {formData.city ? `${formData.city} (+${formData.radius}km)` : 'Not selected'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase mb-1">Placement</p>
                  <p className="font-semibold text-gray-900 flex items-center">
                    <Target size={14} className="mr-1 text-[#046BD2]" /> 
                    {placementInfo[formData.placement].label}
                  </p>
                </div>
              </div>

              {currentStep === 3 && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <p className="text-gray-500 font-medium">Total Cost</p>
                    <p className="text-2xl font-extrabold text-[#046BD2]">€{totalCost.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`font-semibold px-6 py-2.5 rounded-xl transition-all ${
            currentStep === 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Back
        </button>
        
        {currentStep < 3 ? (
          <button
            onClick={handleNext}
            className="flex items-center text-white bg-[#046BD2] hover:bg-[#035bb3] font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Continue <ChevronRight size={18} className="ml-1" />
          </button>
        ) : (
          <button
            onClick={submitCampaign}
            disabled={isLoading}
            className="flex items-center text-white bg-green-500 hover:bg-green-600 font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">Processing...</span>
            ) : (
              <span className="flex items-center"><Play size={18} className="mr-2 fill-current" /> Launch Campaign</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
