'use client';

import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SocialLogin from '../ui/SocialLogin';
import OTPInput from '../ui/OTPInput';

export default function RegisterForm({ onToggleMode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    username: '',
    password: '',
    confirmPassword: '',
    country: '',
    termsAccepted: false,
    promotionalAccepted: false,
    gdprAccepted: false,
  });

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register submitted', formData);
  };

  return (
    <div className="w-full relative">
      {step > 1 && (
        <div className="absolute top-0 right-0 font-medium text-[#046BD2] text-[14px]">
          Step {step - 1} / 2
        </div>
      )}

      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Create Account</h2>
          <p className="text-[14px] text-[#333333] mb-[30px]">
            Please provide your details to register on DealNBuy
          </p>

          <form onSubmit={nextStep} className="flex flex-col gap-[20px] w-full">
            <Input 
              id="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <div className="flex flex-col gap-[12px] mt-[5px]">
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
                  id="promotionalAccepted" 
                  checked={formData.promotionalAccepted}
                  onChange={handleChange}
                  className="mt-1 flex-shrink-0 w-4 h-4 text-[#046BD2] bg-gray-100 border-gray-300 rounded focus:ring-[#046BD2]" 
                />
                <label htmlFor="promotionalAccepted" className="text-[12px] text-gray-600 leading-snug">
                  I agree to receive promotional emails and updates.
                </label>
              </div>
            </div>

            <Button type="submit" className="mt-[10px]">Continue</Button>
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
            <span className="font-medium">Enter Your Otp here</span>
          </p>

          <form onSubmit={nextStep} className="flex flex-col gap-[20px] w-full">
            <OTPInput 
              value={formData.otp}
              onChange={(val) => setFormData(prev => ({ ...prev, otp: val }))}
              length={6}
            />
            <Button type="submit" className="mt-[10px]">Continue</Button>
          </form>

          <div className="flex justify-center items-center mt-[25px]">
             <button type="button" className="text-[#046BD2] hover:underline text-[14px]">
               Resend One-Time Password
             </button>
          </div>
          <div className="flex justify-center items-center mt-[15px]">
             <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-700 text-[14px] underline">Back to Email</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in duration-300 mt-[20px]">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Create Profile</h2>
          <p className="text-[14px] text-[#333333] mb-[30px] leading-relaxed">
            Please set your password and select your country.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[15px] w-full">
            <Input 
              id="username"
              type="text"
              placeholder="Username"
              value={formData.username}
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

            <div className="flex items-start gap-2 mt-[10px]">
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

            <Button type="submit" className="mt-2 text-[14px] font-bold">Submit</Button>
          </form>
          
          <div className="flex justify-center items-center mt-[20px]">
             <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-700 text-[14px] underline">Back to OTP Verification</button>
          </div>
        </div>
      )}
    </div>
  );
}
