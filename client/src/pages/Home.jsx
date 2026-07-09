import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* Placeholder image, later replaced with Cloudinary/Assets */}
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Luxury Fashion" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white px-4">
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 uppercase"
          >
            Elegance Defined
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light tracking-wide"
          >
            Discover the new season's collection. Crafted with precision, designed for the modern individual.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/shop" className="bg-gold text-white px-8 py-4 uppercase tracking-widest text-sm hover:bg-black transition-colors duration-300">
              Shop Collection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories (Placeholder) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold uppercase tracking-widest text-primary dark:text-secondary">Curated Collections</h2>
          <div className="h-1 w-24 bg-gold mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Category Card 1 */}
          <Link to="/shop?category=Women" className="group relative h-96 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1515347619362-7104b2b4bc66?q=80&w=1951&auto=format&fit=crop" alt="Women" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl text-white font-bold uppercase tracking-wider mb-2">Women</h3>
              <span className="text-white text-sm uppercase tracking-widest border-b border-gold pb-1">Shop Now</span>
            </div>
          </Link>

          {/* Category Card 2 */}
          <Link to="/shop?category=Office" className="group relative h-96 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1995&auto=format&fit=crop" alt="Office Kit" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl text-white font-bold uppercase tracking-wider mb-2">Office Kit</h3>
              <span className="text-white text-sm uppercase tracking-widest border-b border-gold pb-1">Shop Now</span>
            </div>
          </Link>

          {/* Category Card 3 */}
          <Link to="/shop?category=Accessories" className="group relative h-96 overflow-hidden bg-gray-200">
            <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop" alt="Accessories" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl text-white font-bold uppercase tracking-wider mb-2">Accessories</h3>
              <span className="text-white text-sm uppercase tracking-widest border-b border-gold pb-1">Shop Now</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
