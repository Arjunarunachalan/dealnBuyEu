'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '../ui/Input';
import Button from '../ui/Button';
import OTPInput from '../ui/OTPInput';

export default function ForgetPasswordForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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
    // Simulate navigation/success behavior or connect to API later
    console.log('Password reset submitted', formData);
  };

  return (
    <div className="w-full relative">
      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[20px]">Let's find your Account</h2>

          <form onSubmit={nextStep} className="flex flex-col gap-[20px] w-full mt-[30px]">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[14px] font-medium text-[#333333]">
                Enter your registered email
              </label>
              <Input 
                id="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button type="submit" className="mt-[10px]">Continue</Button>
          </form>

          <div className="flex justify-center items-center mt-[15px]">
            <Link href="/registration_login" className="text-[#046BD2] hover:underline text-[14px] font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in duration-300 mt-[20px]">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Verify OTP</h2>
          <p className="text-[14px] text-[#333333] mb-[30px] leading-relaxed">
            We have sent a verification code to your email <br/>
            <span className="font-medium">Enter Your OTP here</span>
          </p>

          <form onSubmit={nextStep} className="flex flex-col gap-[20px] w-full mt-2">
            <OTPInput 
              value={formData.otp}
              onChange={(val) => setFormData(prev => ({ ...prev, otp: val }))}
              length={6}
            />
            <Button type="submit" className="mt-[10px]">Verify & Continue</Button>
          </form>

          <div className="flex justify-center items-center mt-[25px]">
             <button type="button" className="text-[#046BD2] hover:underline text-[14px]">
               Resend OTP
             </button>
          </div>
          <div className="flex justify-center items-center mt-[15px]">
             <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-700 text-[14px] underline">Back to Email</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-in fade-in duration-300 mt-[20px]">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[10px]">Reset Password</h2>
          <p className="text-[14px] text-[#333333] mb-[30px] leading-relaxed">
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[15px] w-full">
            <Input 
              id="newPassword"
              type="password"
              placeholder="New Password"
              value={formData.newPassword}
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

            <Button type="submit" className="mt-2 text-[14px] font-bold">Reset Password</Button>
          </form>
          
          <div className="flex justify-center items-center mt-[20px]">
             <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-700 text-[14px] underline">Back to OTP Verification</button>
          </div>
        </div>
      )}
    </div>
  );
}
