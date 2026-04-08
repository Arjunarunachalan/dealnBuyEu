'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/ui/Button';

export default function PreGoogleConsent() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    country: '',
    gdprAccepted: false,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.country || !formData.gdprAccepted) {
       setErrorMsg("Please complete all required fields");
       return;
    }

    try {
      localStorage.setItem("google_signup_meta", JSON.stringify({
        country: formData.country,
        gdprAccepted: formData.gdprAccepted
      }));
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`;
    } catch (err) {
      setErrorMsg("Failed to store consent configuration.");
    }
  };

  const isValid = formData.country && formData.gdprAccepted;

  return (
    <main className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-[500px] bg-white rounded-lg shadow-xl overflow-hidden p-[30px] md:p-[50px]">
        <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Google Sign Up</h2>
        <p className="text-[14px] text-[#333333] mb-[20px]">
          Before continuing to Google, please provide the following details to ensure compliance.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[15px] w-full">
          <div className="flex flex-col mt-[5px]">
            <select 
              id="country" 
              value={formData.country}
              onChange={handleChange}
              className="w-full h-[48px] px-[15px] bg-[#EBEBEB] border-[0.8px] border-[rgba(149,149,149,0.52)] rounded-[5px] text-[14px] text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#046BD2] focus:border-[#046BD2] transition-colors appearance-none"
              required
            >
              <option value="" disabled>Select Country</option>
              <option value="France">France</option>
              <option value="Spain">Spain</option>
              <option value="Portugal">Portugal</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-[12px] mt-[10px]">
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                id="gdprAccepted" 
                checked={formData.gdprAccepted}
                onChange={handleChange}
                className="mt-1 flex-shrink-0 w-4 h-4 text-[#046BD2] bg-gray-100 border-gray-300 rounded focus:ring-[#046BD2]" 
                required 
              />
              <label htmlFor="gdprAccepted" className="text-[12px] text-gray-600 leading-snug">
                I agree to the processing of my personal data according to the GDPR consent and acknowledge the Privacy Policy.
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!isValid}
            className={`mt-[10px] ${(!isValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue to Google
          </Button>

          <Button 
             type="button"
             className="mt-2 bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-100"
             onClick={() => router.back()}
          >
             Cancel
          </Button>
        </form>
      </div>
    </main>
  );
}
