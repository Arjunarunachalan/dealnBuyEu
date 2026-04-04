'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SocialLogin from '../ui/SocialLogin';
import api from '../../lib/axiosInstance';
import { useAuthStore } from '../../store/useAuthStore';

export default function LoginForm({ onToggleMode }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/login', formData);
      if (res.data.accessToken) {
        useAuthStore.getState().login(
          { 
            name: res.data.name, 
            surname: res.data.surname, 
            pseudoName: res.data.pseudoName, 
            email: res.data.email,
            role: res.data.role 
          },
          res.data.accessToken
        );
        router.push('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="w-full">
      <h2 className="text-[#046BD2] text-[26px] font-bold mb-[25px]">DealNBuy</h2>
      <p className="text-[14px] text-[#333333] mb-[30px]">
        Please provide your Email Login on DealNBuy
      </p>

      {errorMsg && (
        <div className="mb-[20px] p-[10px] text-[13px] text-red-600 bg-red-50 border-[0.8px] border-red-200 rounded-[5px]">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] w-full">
        <Input 
          id="email"
          label="Email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input 
          id="password"
          type="password"
          label="Password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button type="submit" isLoading={loading} disabled={loading} className="mt-2">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="flex justify-between items-center mt-[20px] text-[13px]">
        <Link href="/forgetpassword" className="text-[#046BD2] hover:underline font-medium">
          Forgot Password?
        </Link>
        <span className="text-[#333333]">
          Don't have an account?{' '}
          <button type="button" onClick={onToggleMode} suppressHydrationWarning className="text-[#046BD2] hover:underline font-medium">
            Signup
          </button>
        </span>
      </div>

      <div className="mt-[25px]">
        <SocialLogin 
          provider="Google" 
          text="Sign up via Google" 
          onClick={() => console.log('Google login')} 
        />
      </div>
    </div>
  );
}
