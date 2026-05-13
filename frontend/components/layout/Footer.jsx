'use client';

import { useState } from 'react';
import Link from 'next/link';
import { COUNTRY_LIST } from '../../constants/countries';
import { X, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../lib/axiosInstance';


function ContactModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await api.post('/contact', form);
      if (res.data?.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(res.data?.message || 'Failed to send');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: 'contactSlideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#046BD2] to-[#0E8ED3] px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Contact Us</h2>
            <p className="text-blue-100 text-sm mt-0.5">We&apos;d love to hear from you!</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm mb-6">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
              <button
                onClick={onClose}
                className="bg-[#046BD2] hover:bg-[#035bb3] text-white font-semibold px-8 py-2.5 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#046BD2]/30 focus:border-[#046BD2] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#046BD2]/30 focus:border-[#046BD2] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#046BD2]/30 focus:border-[#046BD2] transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Message *</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#046BD2]/30 focus:border-[#046BD2] transition"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-[#046BD2] hover:bg-[#035bb3] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={16} /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes contactSlideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}


export default function Footer() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [contactOpen, setContactOpen] = useState(false);

  const countries = COUNTRY_LIST;


  return (
    <footer className="w-full mt-12 flex flex-col">
      {/* 1. Top Contact Banner */}
      <div className="bg-[#046BD2] py-6 sm:py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white text-[15px] sm:text-[16px] max-w-2xl text-center md:text-left leading-snug">
            Have a question, suggestion, or just want to say hi? We'd love to hear from you! Our team at Deal and Buy is always eager to assist you.
          </p>
          <button 
            suppressHydrationWarning 
            onClick={() => setContactOpen(true)}
            className="bg-white text-[#046BD2] font-semibold text-[15px] px-8 py-2.5 rounded hover:bg-gray-100 transition-colors whitespace-nowrap shadow-sm"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* 2. App Download Banner */}
      <div className="bg-gradient-to-r from-[#0E8ED3] via-[#04C9BB] to-[#04E7A6] py-14 sm:py-16 relative overflow-hidden">
        {/* Soft radial background effect matching the design */}
        <div className="absolute top-0 right-[-10%] w-[50%] h-[200%] rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[-50%] left-[-10%] w-[40%] h-[150%] rounded-full bg-[#00A1FF]/20 blur-3xl mix-blend-overlay"></div>
        
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">Get the DealNBuy App</h2>
          <p className="text-white text-base md:text-[17px] mb-8 font-medium">Shop smarter, discover better deals — on the go!</p>
          
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a href="#" className="inline-block hover:-translate-y-1 transition-transform duration-200">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/82/Google_Play_Store_badge_EN.svg" 
                alt="Get it on Google Play" 
                className="h-[44px] sm:h-[48px] brightness-110" 
              />
            </a>
            <a href="#" className="inline-block hover:-translate-y-1 transition-transform duration-200 bg-black rounded-[6px] overflow-hidden border-[1.5px] border-black">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                alt="Download on the App Store" 
                className="h-[40px] sm:h-[44px] px-2 py-0.5 object-contain" 
              />
            </a>
          </div>
        </div>
      </div>

      {/* 3. Dark Footer Links */}
      <div className="bg-[#111111] text-white pt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between mb-10 gap-10">
            {/* Logo */}
            <div className="lg:w-1/4">
               <Link href="/" className="text-[26px] font-bold text-[#046BD2] inline-block mb-4 tracking-tight">
                   DealNBuy
               </Link>
            </div>

            {/* Links Columns */}
            <div className="lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
               {/* Company */}
               <div>
                  <h4 className="font-bold text-[17px] mb-5 tracking-wide">Company</h4>
                  <ul className="space-y-3.5 text-[14px] text-gray-300">
                     <li><Link href="/about" className="hover:text-white transition-colors block">About Us</Link></li>
                     <li><Link href="/terms-conditions" className="hover:text-white transition-colors block">Terms & Conditions</Link></li>
                     <li><Link href="/privacy-policy" className="hover:text-white transition-colors block">Privacy Policy</Link></li>
                     <li><Link href="/cookies-policy" className="hover:text-white transition-colors block">Cookies and Similar Technologies</Link></li>
                     <li><Link href="/help-center" className="hover:text-white transition-colors block">Help Center</Link></li>
                  </ul>
               </div>
               
               {/* Locations & Country Selection */}
               <div>
                  <h4 className="font-bold text-[17px] mb-5 tracking-wide">Locations</h4>
                  <ul className="space-y-3.5 text-[14px] text-gray-300 mb-8">
                     <li><Link href="/categories" className="hover:text-white transition-colors block">Browse All</Link></li>
                  </ul>
                  
                  {/* Preserved Country Switcher */}
                  <h4 className="font-bold text-[17px] mb-4 tracking-wide">International</h4>
                  <div className="space-y-3">
                     <select
                        suppressHydrationWarning
                        className="w-full text-[14px] pl-3 pr-10 py-2.5 border border-gray-700/60 rounded bg-[#222222] text-white focus:outline-none focus:border-[#046BD2] cursor-pointer appearance-none shadow-inner"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                     >
                        <option value="" disabled>Select Country</option>
                        {countries.map(c => <option key={c.code} value={c.url}>{c.name}</option>)}
                     </select>
                     {selectedCountry && (
                        <a 
                           href={selectedCountry} 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           className="bg-[#046BD2] hover:bg-[#035bb3] text-white text-[14px] font-medium py-2.5 rounded flex justify-center w-full transition-colors shadow-sm"
                        >
                           Go to site
                        </a>
                     )}
                  </div>
               </div>

               {/* Contact Us */}
               <div>
                  <h4 className="font-bold text-[17px] mb-5 tracking-wide">Contact Us</h4>
                  <div className="text-[14px] text-gray-300">
                     <span className="block mb-1">Email:</span>
                     <a href="mailto:contact.in@dealnbuy.co.in" className="text-white hover:text-[#046BD2] transition-colors font-medium break-all block py-1">
                        contact.in@dealnbuy.co.in
                     </a>
                  </div>
               </div>
            </div>
          </div>

          {/* Copyright Bottom */}
          <div className="border-t border-gray-800/60 py-6 flex flex-col md:flex-row justify-between items-center text-[13px] text-gray-400 gap-4">
            <p suppressHydrationWarning>Copyright © 2023 - {new Date().getFullYear()} DealNBuy. All rights reserved.</p>
            <div className="flex space-x-6 sm:space-x-8">
               <Link href="/terms-conditions" className="hover:text-white transition-colors underline decoration-gray-600 underline-offset-4">Terms Of Use</Link>
               <Link href="/privacy-policy" className="hover:text-white transition-colors underline decoration-gray-600 underline-offset-4">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </footer>
  );
}
