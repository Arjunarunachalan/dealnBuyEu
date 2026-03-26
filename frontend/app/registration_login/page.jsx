'use client';

import { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import AuthIllustration from '../../components/auth/AuthIllustration';

export default function RegistrationLogin() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  return (
    <main className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-4 py-8 md:py-12">
      <div className="w-full max-w-[960px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Form Container */}
        <div className="w-full md:w-[60%] p-[30px] md:p-[50px] flex flex-col justify-center bg-white relative z-10 transition-all duration-300">
          {isLogin ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onToggleMode={toggleMode} />
          )}
        </div>

        {/* Illustration Container */}
        <AuthIllustration />
      </div>
    </main>
  );
}
