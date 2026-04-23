import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LegalLayout({ children, activePage }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      {/* Breadcrumb area, similar to screenshot */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8 py-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600 text-blue-600">Home</Link> <span className="mx-2">&gt;</span> 
          <span>Legal and Privacy</span> <span className="mx-2">&gt;</span> 
          <span className="text-gray-800">
            {activePage === 'privacy' 
              ? 'Privacy Policy' 
              : activePage === 'terms' 
                ? 'Terms and Conditions' 
                : 'Cookies & Tracking Policy'}
          </span>
        </div>
      </div>

      <div className="flex-grow container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-7xl flex flex-col md:flex-row gap-8 lg:gap-16">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h3 className="font-bold text-xl mb-6 text-gray-900">Legal and Privacy</h3>
          <ul className="space-y-4">
            <li>
              <Link 
                href="/privacy-policy" 
                className={`block text-[15px] ${activePage === 'privacy' ? 'text-blue-600 font-semibold border-l-2 border-blue-600 pl-3 -ml-[14px]' : 'text-gray-600 hover:text-blue-600 pl-3 -ml-[14px] border-l-2 border-transparent'}`}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link 
                href="/terms-conditions" 
                className={`block text-[15px] ${activePage === 'terms' ? 'text-blue-600 font-semibold border-l-2 border-blue-600 pl-3 -ml-[14px]' : 'text-gray-600 hover:text-blue-600 pl-3 -ml-[14px] border-l-2 border-transparent'}`}
              >
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link 
                href="/cookies-policy" 
                className={`block text-[15px] ${activePage === 'cookies' ? 'text-blue-600 font-semibold border-l-2 border-blue-600 pl-3 -ml-[14px]' : 'text-gray-600 hover:text-blue-600 pl-3 -ml-[14px] border-l-2 border-transparent'}`}
              >
                Cookies & Tracking Policy
              </Link>
            </li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow max-w-4xl">
          {children}
        </div>
        
      </div>

      <Footer />
    </div>
  );
}
