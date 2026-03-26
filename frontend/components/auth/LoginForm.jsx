'use client';

import Link from 'next/link';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SocialLogin from '../ui/SocialLogin';

export default function LoginForm({ onToggleMode }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Dummy submit
    console.log('Login submitted');
  };

  return (
    <div className="w-full">
      <h2 className="text-[#046BD2] text-[26px] font-bold mb-[25px]">DealNBuy</h2>
      <p className="text-[14px] text-[#333333] mb-[30px]">
        Please provide your Email Login on DealNBuy
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[20px] w-full">
        <Input 
          id="identifier"
          label=" Email"
          placeholder=" Email"
          required
        />
        <Input 
          id="password"
          type="password"
          label="Password"
          placeholder="Password"
          required
        />

        <Button type="submit" className="mt-2">Login</Button>
      </form>

      <div className="flex justify-between items-center mt-[20px] text-[13px]">
        <Link href="/forgetpassword" className="text-[#046BD2] hover:underline font-medium">
          Forgot Password?
        </Link>
        <span className="text-[#333333]">
          Don't have an account?{' '}
          <button type="button" onClick={onToggleMode} className="text-[#046BD2] hover:underline font-medium">
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
