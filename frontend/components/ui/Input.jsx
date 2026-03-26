'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ label, type = 'text', id, ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-[8px] w-full">
      {label && (
        <label htmlFor={id} className="text-[12px] font-normal capitalize text-[#333333]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className="w-full h-[48px] px-[15px] bg-[#EBEBEB] border-[0.8px] border-[rgba(149,149,149,0.52)] rounded-[5px] text-[14px] text-[#333333] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#046BD2] focus:border-[#046BD2] transition-colors"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-[15px] top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
