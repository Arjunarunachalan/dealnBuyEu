'use client';

import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Users, Globe, Shield, Heart, Target, Zap } from 'lucide-react';

const VALUES = [
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'We prioritize creating a secure marketplace where every transaction is backed by verified profiles and robust moderation.',
    color: 'bg-blue-50 text-[#046BD2]',
  },
  {
    icon: Globe,
    title: 'Local First',
    description: 'DealNBuy connects you with buyers and sellers in your community, making it easy to find great deals nearby.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Heart,
    title: 'Community Driven',
    description: 'Built by the community, for the community. We listen to our users and continuously improve based on your feedback.',
    color: 'bg-rose-50 text-rose-500',
  },
  {
    icon: Zap,
    title: 'Simple & Fast',
    description: 'Post an ad in seconds, find what you need instantly. Our streamlined experience puts convenience first.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Target,
    title: 'Fair Pricing',
    description: 'No hidden fees, no commission cuts. List your items for free and negotiate directly with interested buyers.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Users,
    title: 'For Everyone',
    description: 'Whether you\'re decluttering, upgrading, or looking for a bargain — DealNBuy is the platform for you.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#046BD2] via-[#0E8ED3] to-[#04C9BB] text-white py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[200%] rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-[-10%] w-[30%] h-[150%] rounded-full bg-[#00A1FF]/10 blur-3xl"></div>
        
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            About DealNBuy
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            We're building the most trusted local marketplace in Europe — connecting people to buy, sell, and discover amazing deals right in their neighborhood.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#046BD2] font-bold text-sm uppercase tracking-widest">Our Mission</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3 mb-5">
              Making local commerce easy, safe, and accessible for everyone.
            </h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              DealNBuy was founded with a simple idea: that buying and selling locally should be effortless. 
              We saw too many people with great items they no longer needed and others looking for exactly those things 
              — but no easy way to connect them.
            </p>
            <p className="text-gray-600 leading-relaxed text-[15px] mt-4">
              Today, DealNBuy serves thousands of users across Europe, helping communities reduce waste, 
              save money, and discover unique finds — all while keeping commerce local and personal.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 sm:p-10 border border-blue-100">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#046BD2] rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-lg">1M+</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Growing Community</p>
                  <p className="text-sm text-gray-500">Users discovering deals daily</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-lg">EU</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Europe-Wide</p>
                  <p className="text-sm text-gray-500">Serving communities across Europe</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white font-bold text-lg">0€</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Free to Use</p>
                  <p className="text-sm text-gray-500">No listing fees, no hidden costs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#046BD2] font-bold text-sm uppercase tracking-widest">Our Values</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3">What drives us forward</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div 
                  key={val.title} 
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className={`w-12 h-12 rounded-xl ${val.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{val.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[700px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 text-[15px] mb-8">Join thousands of users who are already buying and selling on DealNBuy.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="/postadd" 
              className="bg-[#046BD2] hover:bg-[#035bb3] text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
            >
              Post Your First Ad
            </a>
            <a 
              href="/categories" 
              className="border-2 border-gray-200 hover:border-[#046BD2] text-gray-700 hover:text-[#046BD2] font-bold px-8 py-3.5 rounded-xl transition-all"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
