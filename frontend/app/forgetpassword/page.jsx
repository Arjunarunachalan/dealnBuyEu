import ForgetPasswordForm from '../../components/auth/ForgetPasswordForm';
import { KeyRound } from 'lucide-react';

export default function ForgetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-4 py-8 md:py-12">
      <div className="w-full max-w-[960px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Form Container */}
        <div className="w-full md:w-[60%] p-[30px] md:p-[50px] flex flex-col justify-center bg-white relative z-10 transition-all duration-300">
          <ForgetPasswordForm />
        </div>

        {/* Illustration Container */}
        <div className="w-full md:w-[40%] bg-[#046BD2] hidden md:flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] border border-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] border border-white/10 rounded-full -translate-x-1/2 translate-y-1/4" />
          
          <div className="relative z-10 bg-white/10 p-8 rounded-full backdrop-blur-sm border border-white/20">
            <KeyRound size={64} className="text-white" />
          </div>
          
          <div className="mt-8 text-white relative z-10 text-center px-8">
            <h3 className="text-[20px] font-bold mb-2">Secure Recovery</h3>
            <p className="text-[14px] text-white/80">Get back access to your account quickly and securely.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
