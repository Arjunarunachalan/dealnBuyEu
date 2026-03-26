'use client';

import { useState, useRef, useEffect } from 'react';

export default function OTPInput({ length = 6, value = '', onChange }) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Sync external value with internal array if needed
    const valArray = value.split('').slice(0, length);
    const newOtp = Array(length).fill('');
    valArray.forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Allow only numeric input
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // take only the last character entered
    newOtp[index] = val.substring(val.length - 1);
    
    setOtp(newOtp);
    const newValue = newOtp.join('');
    onChange(newValue);

    // move to next input
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;
    
    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);
    onChange(newOtp.join(''));
    
    // Focus next empty input or last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  return (
    <div className="flex justify-between items-center w-full gap-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-full aspect-square text-center text-[18px] font-semibold bg-[#EBEBEB] border-[0.8px] border-[rgba(149,149,149,0.52)] rounded-[5px] focus:outline-none focus:ring-1 focus:ring-[#046BD2] focus:border-[#046BD2] transition-colors"
          required
        />
      ))}
    </div>
  );
}
