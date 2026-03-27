'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import OTPInput from '../ui/OTPInput';
import api from '../../lib/axiosInstance';

export default function ForgetPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setErrorMsg('');
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/auth/forgot-password', { email: formData.email });
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/auth/verify-reset-otp', { 
        email: formData.email, 
        otp: formData.otp 
      });
      setStep(3);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      
      if (res.data.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
        router.push('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      {errorMsg && (
        <div className="mb-[20px] p-[10px] text-[13px] text-red-600 bg-red-50 border-[0.8px] border-red-200 rounded-[5px]">
          {errorMsg}
        </div>
      )}

      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <h2 className="text-[#046BD2] text-[26px] font-bold mb-[20px]">Let's find your Account</h2>

          <form onSubmit={handleSendOtp} className="flex flex-col gap-[20px] w-full mt-[30px]">
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
            
            <Button type="submit" isLoading={loading} disabled={loading} className="mt-[10px]">
              {loading ? 'Sending OTP...' : 'Continue'}
            </Button>
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

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-[20px] w-full mt-2">
            <OTPInput 
              value={formData.otp}
              onChange={(val) => {
                setErrorMsg('');
                setFormData(prev => ({ ...prev, otp: val }));
              }}
              length={6}
            />
            <Button type="submit" isLoading={loading} disabled={loading} className="mt-[10px]">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </form>

          <div className="flex justify-center items-center mt-[25px]">
             <button type="button" onClick={() => handleSendOtp()} disabled={loading} className="text-[#046BD2] hover:underline text-[14px]">
               {loading ? 'Sending...' : 'Resend OTP'}
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

            <Button type="submit" isLoading={loading} disabled={loading} className="mt-2 text-[14px] font-bold">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          
          <div className="flex justify-center items-center mt-[20px]">
             <button type="button" onClick={prevStep} className="text-gray-500 hover:text-gray-700 text-[14px] underline">Back to OTP Verification</button>
          </div>
        </div>
      )}
    </div>
  );
}
