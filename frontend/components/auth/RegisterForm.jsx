'use client';

import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SocialLogin from '../ui/SocialLogin';
import OTPInput from '../ui/OTPInput';
import { useRouter } from 'next/navigation';
import api from '../../lib/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';

export default function RegisterForm({ onToggleMode }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    name: '',
    surname: '',
    pseudoName: '',
    password: '',
    confirmPassword: '',
    country: '',
    termsAccepted: false,
    gdprAccepted: false,
  });

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setErrorMsg('');
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setErrorMsg("Passwords do not match");
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/register', {
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        pseudoName: formData.pseudoName,
        password: formData.password,
        country: formData.country,
        authProvider: 'local'
      });
      
      console.log(res.data.message);
      setStep(prev => prev + 1);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });

      // Update state via Zustand store directly 
      if (res.data.accessToken) {
        useAuthStore.getState().login(
          { name: res.data.name || formData.name, surname: res.data.surname || formData.surname, pseudoName: res.data.pseudoName || formData.pseudoName, email: formData.email },
          res.data.accessToken
        );
      }

      console.log("Verified successfully!");
      router.push('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "OTP Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.termsAccepted && formData.gdprAccepted;

  return (
    <div className="w-full relative">
      {step > 0 && (
        <div className="absolute top-0 right-0 font-medium text-[#046BD2] text-[14px]">
          Step {step} / 2
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded text-center font-medium">
          {errorMsg}
        </div>
      )}

      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Create Account</h2>
          <p className="text-[14px] text-[#333333] mb-[20px]">
            Please provide your details to register on DealNBuy
          </p>

          <form onSubmit={nextStep} className="flex flex-col gap-[15px] w-full">
            <Input 
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input 
              id="name"
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <Input 
              id="surname"
              type="text"
              placeholder="Surname"
              value={formData.surname}
              onChange={handleChange}
              required
            />
            
            <Input 
              id="pseudoName"
              type="text"
              placeholder="Pseudo Name"
              value={formData.pseudoName}
              onChange={handleChange}
              required
            />
            
            <Input 
              id="password"
              type="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <Input 
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col mt-[5px]">
              <select 
                id="country" 
                value={formData.country}
                onChange={handleChange}
                className="w-full h-[48px] px-[15px] bg-[#EBEBEB] border-[0.8px] border-[rgba(149,149,149,0.52)] rounded-[5px] text-[14px] text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#046BD2] focus:border-[#046BD2] transition-colors appearance-none bg-no-repeat"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.8rem center`,
                  backgroundSize: `1.5em 1.5em`
                }}
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
                  id="termsAccepted" 
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-1 flex-shrink-0 w-4 h-4 text-[#046BD2] bg-gray-100 border-gray-300 rounded focus:ring-[#046BD2]" 
                  required 
                />
                <label htmlFor="termsAccepted" className="text-[12px] text-gray-600 leading-snug">
                  I hereby accept the <a href="#" className="text-[#046BD2] hover:underline">Terms Of Use</a> and <a href="#" className="text-[#046BD2] hover:underline">Privacy Policy</a>
                </label>
              </div>

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
              disabled={!isStep1Valid || loading}
              className={`mt-[10px] ${(!isStep1Valid || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? "Processing..." : "Continue to Verify"}
            </Button>
          </form>

          <div className="flex justify-center items-center mt-[25px] text-[13px]">
            <span className="text-[#333333] font-medium">
              Already Have Account?
            </span>
            <button type="button" onClick={onToggleMode} className="text-[#046BD2] hover:underline font-medium ml-1">
              Login
            </button>
          </div>

          <div className="flex justify-center items-center mt-[5px] text-[13px] font-bold">
            OR
          </div>

          <div className="mt-[5px]">
            <SocialLogin 
              provider="Google" 
              text="Sign up via Google" 
              onClick={() => console.log('Google signup')} 
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in duration-300 mt-[20px]">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Lets Authenticate</h2>
          <p className="text-[14px] text-[#333333] mb-[30px] leading-relaxed">
            We have sent you a One Time Password to your email <br/>
            <span className="font-medium text-[#046BD2]">Enter Your OTP here</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] w-full">
            <OTPInput 
              value={formData.otp}
              onChange={(val) => setFormData(prev => ({ ...prev, otp: val }))}
              length={6}
            />
            <Button type="submit" disabled={loading} className={`mt-[10px] ${loading ? 'opacity-50' : ''}`}>
              {loading ? "Verifying..." : "Verify OTP & Finish"}
            </Button>
          </form>

          <div className="flex justify-center items-center mt-[25px]">
             <button type="button" className="text-[#046BD2] hover:underline text-[14px]">
               Resend One-Time Password
             </button>
          </div>
          <div className="flex justify-center items-center mt-[15px]">
             <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-700 text-[14px] underline">Back to Registration</button>
          </div>
        </div>
      )}
    </div>
  );
}
