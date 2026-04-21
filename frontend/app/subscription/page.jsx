'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Link from 'next/link';
import { 
  Target, 
  LockOpen, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Medal,
  Award,
  Gem
} from 'lucide-react';

export default function SubscriptionPage() {
  const adCount = 40;

  const plans = [
    {
      id: 'silver',
      name: 'Silver Plan',
      status: 'active',
      isUnlocked: true,
      tagText: 'FREE UNLOCKED',
      cardMessage: '🎉 Unlocked - FREE for 30 days!',
      buttonText: 'Active Plan',
      buttonIcon: <CheckCircle2 size={18} className="mr-2" />,
      features: [
        '2 Boosts/mo',
        'Unlock after 10 posts',
        'Render on Single Category Top',
        '30 Days Validity'
      ],
      icon: <Award className="text-gray-400" size={24} />
    },
    {
      id: 'golden',
      name: 'Golden plan',
      status: 'available',
      isUnlocked: true,
      tagText: 'FREE UNLOCKED',
      cardMessage: '🎉 Unlocked - FREE for 30 days!',
      buttonText: 'Activate Plan',
      buttonIcon: <Sparkles size={18} className="mr-2" />,
      features: [
        '3 Boosts/mo',
        'Unlock after 20 posts',
        'Render on Home Page',
        '30 Days Validity'
      ],
      icon: <Medal className="text-yellow-500" size={24} />
    },
    {
      id: 'platinum',
      name: 'Platinum Plan',
      status: 'available',
      isUnlocked: true,
      tagText: 'FREE UNLOCKED',
      cardMessage: '🎉 Unlocked - FREE for 30 days!',
      buttonText: 'Activate Plan',
      buttonIcon: <Sparkles size={18} className="mr-2" />,
      features: [
        '4 Boosts/mo',
        'Unlock after 40 posts',
        'Render on Home Page Top',
        '30 Days Validity'
      ],
      icon: <Gem className="text-[#046BD2]" size={24} />
    }
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl rounded-full mix-blend-multiply pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-indigo-400/10 rounded-full blur-3xl mix-blend-multiply pointer-events-none"></div>
      
      <Navbar />

      <div className="flex-grow max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-10">
          <Link href="/" className="hover:text-[#046BD2] transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-[#046BD2] font-medium">Subscribe</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-16">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
              We've got a plan <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#046BD2] to-indigo-600">
                that's perfect for you
              </span>
            </h1>
            <div className="flex items-center bg-white/60 backdrop-blur-sm border border-pink-100 px-4 py-2 rounded-full w-fit shadow-sm">
              <Target className="text-pink-500 mr-2" size={20} />
              <p className="font-semibold text-gray-700 text-sm md:text-base">
                Post more ads to unlock premium plans for FREE!
              </p>
            </div>
          </div>

          {/* Remaining Ads Widget */}
          <div className="bg-white p-5 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 w-full lg:w-80 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-center bg-gradient-to-r from-[#046BD2] to-[#035bb3] text-white px-4 py-3 rounded-xl font-bold mb-4 shadow-md">
              <span className="tracking-wide">Remaining Ad Count</span>
              <span className="bg-white text-[#046BD2] px-3 py-1 rounded-lg text-lg shadow-sm">
                {adCount}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-200/50 flex items-center justify-center mr-3 shadow-sm">
                   <Award className="text-gray-500" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-bold text-[#046BD2]">Silver:</span> <span className="font-medium text-gray-600">10 posts</span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                    <div className="bg-gray-400 h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center bg-amber-50 p-3 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3 shadow-sm">
                   <Medal className="text-amber-500" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-bold text-amber-600">Golden:</span> <span className="font-medium text-gray-600">20 posts</span>
                  </p>
                  <div className="w-full bg-amber-200/50 rounded-full h-1.5 mt-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center bg-blue-50 p-3 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
                   <Gem className="text-[#046BD2]" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-bold text-[#046BD2]">Platinum:</span> <span className="font-medium text-gray-600">40 posts</span>
                  </p>
                  <div className="w-full bg-blue-200/50 rounded-full h-1.5 mt-1.5">
                    <div className="bg-[#046BD2] h-1.5 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-[24px] shadow-lg hover:shadow-2xl border-2 transition-all duration-300 group flex flex-col hover:-translate-y-2
                ${plan.status === 'active' ? 'border-[#10B981]' : 'border-gray-100 hover:border-[#046BD2]/30'}
              `}
            >
              {/* Unlocked Tag */}
              {plan.isUnlocked && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10B981] text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full flex items-center shadow-lg uppercase tracking-wider z-10">
                  <LockOpen size={14} className="mr-1.5" /> {plan.tagText}
                </div>
              )}

              <div className="pt-10 pb-6 px-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
                  {plan.icon} {plan.name}
                </h3>
                
                {/* Special Unlocked Banner inside card */}
                {plan.cardMessage && (
                  <div className="bg-[#10B981]/10 rounded-xl p-4 mb-8 flex flex-col items-center justify-center text-center border border-[#10B981]/20">
                    <p className="text-[#10B981] font-bold text-sm leading-relaxed flex items-center gap-2">
                      {plan.cardMessage}
                    </p>
                  </div>
                )}

                {/* Primary CTA */}
                <button 
                  className={`w-full font-bold py-3.5 rounded-xl flex justify-center items-center transition-all duration-300 shadow-sm
                    ${plan.status === 'active' 
                      ? 'bg-[#10B981] text-white hover:bg-[#059669] hover:shadow-md' 
                      : 'bg-gray-50 text-[#10B981] border-2 border-[#10B981] hover:bg-[#10B981] hover:text-white hover:shadow-md'
                    }
                  `}
                >
                  {plan.buttonIcon}
                  <span>{plan.buttonText}</span>
                </button>

                <div className="mt-8">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5 text-sm uppercase tracking-wider">
                    Features
                  </h4>
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-[15px] text-gray-600 font-medium leading-tight">
                        <CheckCircle2 size={18} className="text-[#046BD2] mr-3 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </main>
  );
}
