'use client';

import { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HelpCircle, ChevronDown, Search, ShoppingBag, Shield, User, CreditCard, MessageCircle, Flag } from 'lucide-react';

const FAQ_SECTIONS = [
  {
    title: 'Getting Started',
    icon: User,
    color: 'text-[#046BD2] bg-blue-50',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click the "Login" button in the top navigation bar and select "Register." You can sign up using your email address or Google account. Fill in your details, verify your email with the OTP code we send, and you\'re ready to go!',
      },
      {
        q: 'Is DealNBuy free to use?',
        a: 'Yes! DealNBuy is completely free for basic listings. You can post ads, browse items, and chat with buyers/sellers at no cost. We also offer premium subscription plans for users who want extra features like featured listings and advanced analytics.',
      },
      {
        q: 'How do I edit my profile?',
        a: 'Go to your profile page by clicking your avatar in the top-right corner and selecting "My Account." From there, you can update your name, profile picture, contact preferences, and interested categories.',
      },
    ],
  },
  {
    title: 'Buying & Selling',
    icon: ShoppingBag,
    color: 'text-emerald-600 bg-emerald-50',
    questions: [
      {
        q: 'How do I post an ad?',
        a: 'Click the "POST FREE AD" button in the navigation bar. Select a category, choose a subcategory, then fill in the details like title, description, price, photos, and location. Click "Post Now" and your ad will be live!',
      },
      {
        q: 'How do I edit or delete my ad?',
        a: 'Go to "My Ads" from the dropdown menu. You\'ll see all your listings with options to view, edit, activate/deactivate, or delete each ad. Click the edit button to update any details.',
      },
      {
        q: 'How do I contact a seller?',
        a: 'On any product page, click the "Chat" button to start a conversation with the seller. You can also make price offers directly through the chat. All messages are stored in your Messages inbox.',
      },
      {
        q: 'How does the offer system work?',
        a: 'When chatting with a seller, buyers can send a price offer by clicking the offer icon in the chat input area. The seller can then accept or reject the offer. Both parties are notified of the outcome.',
      },
    ],
  },
  {
    title: 'Safety & Trust',
    icon: Shield,
    color: 'text-amber-600 bg-amber-50',
    questions: [
      {
        q: 'How do I stay safe when buying or selling?',
        a: 'Always meet in public, well-lit places for in-person exchanges. Never share personal financial information. Use DealNBuy\'s chat system for all communications. Trust your instincts — if a deal feels too good to be true, it probably is.',
      },
      {
        q: 'How do I report a suspicious listing?',
        a: 'On any product page, click the "Report" button (flag icon). Select the reason for reporting and provide any additional details. Our moderation team reviews all reports within 24 hours.',
      },
      {
        q: 'Is my personal information safe?',
        a: 'Absolutely. DealNBuy uses GDPR-compliant encryption for all personal data. Your email, name, and other sensitive fields are encrypted at rest. We never share your information with third parties without your consent.',
      },
    ],
  },
  {
    title: 'Payments & Subscriptions',
    icon: CreditCard,
    color: 'text-purple-600 bg-purple-50',
    questions: [
      {
        q: 'Does DealNBuy handle payments?',
        a: 'DealNBuy is a marketplace platform that connects buyers and sellers. Payments are arranged directly between the parties. We recommend meeting in person for local transactions.',
      },
      {
        q: 'What are subscription plans?',
        a: 'DealNBuy offers optional premium subscription plans that give you benefits like featured listings, priority support, and advanced analytics for your ads. Visit the "Subscription Plans" page for current pricing and features.',
      },
    ],
  },
  {
    title: 'Chat & Messages',
    icon: MessageCircle,
    color: 'text-cyan-600 bg-cyan-50',
    questions: [
      {
        q: 'Why can\'t I send messages?',
        a: 'Make sure you\'re logged in to your account. You need to be registered and verified to use the chat feature. If you\'re still having issues, try refreshing the page or clearing your browser cache.',
      },
      {
        q: 'Can I delete a conversation?',
        a: 'Currently, conversations are kept for your records and safety. If you need to report a conversation for abuse or spam, use the report feature on the product page.',
      },
    ],
  },
  {
    title: 'Reporting Issues',
    icon: Flag,
    color: 'text-red-500 bg-red-50',
    questions: [
      {
        q: 'How do I report a bug or issue?',
        a: 'Use the "Contact Us" form in the footer of any page. Describe the issue in detail, including steps to reproduce it, and our technical team will investigate promptly.',
      },
      {
        q: 'How long does it take to resolve reports?',
        a: 'We aim to review all reports within 24 hours. Complex issues may take longer. You\'ll receive updates via email as your report is processed.',
      },
    ],
  },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 text-left group"
      >
        <span className={`text-[15px] font-medium pr-4 ${isOpen ? 'text-[#046BD2]' : 'text-gray-800'} group-hover:text-[#046BD2] transition-colors`}>
          {question}
        </span>
        <ChevronDown 
          size={18} 
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#046BD2]' : ''}`} 
        />
      </button>
      {isOpen && (
        <div className="pb-4 px-1">
          <p className="text-gray-500 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter FAQs based on search
  const filteredSections = searchQuery.trim()
    ? FAQ_SECTIONS.map(section => ({
        ...section,
        questions: section.questions.filter(
          q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(s => s.questions.length > 0)
    : FAQ_SECTIONS;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#046BD2] via-[#0E8ED3] to-[#04C9BB] text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[200%] rounded-full bg-white/5 blur-3xl"></div>
        
        <div className="max-w-[700px] mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <HelpCircle size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            How can we help?
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Find answers to common questions about using DealNBuy.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-5 py-3.5 bg-white text-gray-900 rounded-xl text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition"
            />
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="max-w-[900px] mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-500 text-sm">Try a different search term or browse all categories below.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-[#046BD2] font-semibold text-sm hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                    <div className={`w-9 h-9 rounded-lg ${section.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <h2 className="font-bold text-gray-900 text-[17px]">{section.title}</h2>
                  </div>
                  <div className="px-6 py-2">
                    {section.questions.map((item) => (
                      <FAQItem key={item.q} question={item.q} answer={item.a} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Still need help CTA */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-[600px] mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Still need help?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Can&apos;t find what you&apos;re looking for? Our team is happy to assist you personally.
          </p>
          <p className="text-sm text-gray-500">
            Scroll down and click <span className="font-semibold text-[#046BD2]">Contact Us</span> in the footer to send us a message.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
