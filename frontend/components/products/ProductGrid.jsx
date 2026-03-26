import ProductCard from './ProductCard';

const dummyProducts = [
  {
    id: 1,
    title: "Yamaha R15 V4 Racing Blue",
    price: "₹ 1,85,000",
    location: "Kochi, Kerala",
    badge: "Verified Seller",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    title: "MacBook Pro M2 - Space Gray",
    price: "₹ 1,20,000",
    location: "Ernakulam, Kerala",
    badge: "Featured",
    rating: 4,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    title: "Sony Alpha a7 III Mirrorless Camera",
    price: "₹ 1,15,000",
    location: "Trivandrum, Kerala",
    badge: "Recommended",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    title: "Royal Enfield Classic 350",
    price: "₹ 1,90,000",
    location: "Kozhikode, Kerala",
    badge: "Verified Seller",
    rating: 4,
    imageUrl: "https://images.unsplash.com/photo-1629859586419-4820dc7fc148?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 5,
    title: "Apple iPhone 14 Pro Max 256GB",
    price: "₹ 1,10,000",
    location: "Thrissur, Kerala",
    badge: "Featured",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 6,
    title: "Samsung 55-inch 4K Smart TV",
    price: "₹ 45,000",
    location: "Kochi, Kerala",
    badge: "",
    rating: 3,
    imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 7,
    title: "Maruti Suzuki Swift VXI 2021",
    price: "₹ 6,50,000",
    location: "Ernakulam, Kerala",
    badge: "Recommended",
    rating: 4,
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 8,
    title: "Dell XPS 13 Laptop i7 16GB",
    price: "₹ 85,000",
    location: "Kottayam, Kerala",
    badge: "Verified Seller",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=400",
  }
];

export default function ProductGrid() {
  return (
    <section className="w-full bg-[#F3F4F6] py-12">
      <div className="max-w-[1240px] mx-auto px-4">
        <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-8">
          Fresh Recommendations
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyProducts.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
