import Navbar from '../components/layout/Navbar';
import HeroCarousel from '../components/home/HeroCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductGrid from '../components/products/ProductGrid';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <Navbar />
      <HeroCarousel />
      <CategoryGrid />
      <ProductGrid />
      <Footer />
    </main>
  );
}
