import { Handshake } from 'lucide-react';

export default function AuthIllustration() {
  return (
    <div className="hidden md:flex flex-col items-center justify-center w-[40%] bg-[#046BD2] text-white p-8 relative overflow-hidden">
      {/* Decorative lines/circles mimicking the original */}
      <div className="absolute w-[300px] h-[300px] border-[0.5px] border-white/20 rounded-full top-[-50px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] border-[0.5px] border-white/20 rounded-full bottom-[-150px] right-[-100px]" />
      
      <div className="z-10 flex flex-col items-center text-center">
        {/* We use Lucide Handshake as a placeholder for the illustration */}
        <div className="w-[180px] h-[180px] bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/20 relative">
          <Handshake size={80} className="text-white opacity-95" strokeWidth={1.5} />
          <div className="absolute top-[20px] right-[20px] bg-blue-400 w-3 h-3 rounded-full animate-pulse" />
          <div className="absolute bottom-[30px] left-[30px] bg-blue-300 w-2 h-2 rounded-full" />
        </div>
      </div>
    </div>
  );
}
