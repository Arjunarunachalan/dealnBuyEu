'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axiosInstance';
import Button from '../../components/ui/Button';

function GoogleRegisterFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [formData, setFormData] = useState({
    country: '',
    gdprAccepted: false,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const completeRegistration = async (country, gdprAccepted) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/google-register', {
        token,
        country,
        gdprAccepted
      });

      // Hydrate via Zustand
      useAuthStore.getState().login(res.data, res.data.accessToken);

      localStorage.removeItem('google_signup_meta');
      setTimeout(() => {
        router.replace('/');
      }, 500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Failed to complete Google Registration.");
      setShowFallback(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.replace('/registration_login?error=Missing_Google_Token');
      return;
    }

    const savedMeta = localStorage.getItem('google_signup_meta');
    if (savedMeta) {
      try {
        const meta = JSON.parse(savedMeta);
        if (meta.country && meta.gdprAccepted) {
           completeRegistration(meta.country, meta.gdprAccepted);
           return;
        }
      } catch (err) {}
    }

    // No metadata found, fallback to manual entry
    setShowFallback(true);
    setLoading(false);
  }, [token, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.country || !formData.gdprAccepted) {
       setErrorMsg("Please complete all required fields");
       return;
    }
    completeRegistration(formData.country, formData.gdprAccepted);
  };

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
  };

  if (loading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
        <div className="flex flex-col items-center">
           <div className="w-10 h-10 border-4 border-[#046BD2] border-t-transparent rounded-full animate-spin"></div>
           <p className="mt-4 text-[#333333] font-medium">Finalizing Google Sign Up...</p>
        </div>
      </div>
     );
  }

  if (showFallback) {
    return (
      <main className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-[500px] bg-white rounded-lg shadow-xl overflow-hidden p-[30px] md:p-[50px]">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Complete Registration</h2>
          <p className="text-[14px] text-[#333333] mb-[20px]">
            Please select your country and accept the terms to complete your account.
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
              disabled={!formData.country || !formData.gdprAccepted}
              className={`mt-[10px] ${(!formData.country || !formData.gdprAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Complete Sign Up
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return null;
}

export default function RegisterGooglePage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
         <p className="mt-4 text-[#333333] font-medium">Loading...</p>
       </div>
    }>
      <GoogleRegisterFlow />
    </Suspense>
  );
}
