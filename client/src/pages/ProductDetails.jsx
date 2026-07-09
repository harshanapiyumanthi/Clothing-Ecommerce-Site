import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiMinus, FiPlus, FiStar } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';

const ProductDetails = () => {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const dispatch = useDispatch();

  // Mock Data for single product
  const product = {
    id: 1,
    name: 'Silk Evening Gown',
    price: 299,
    description: 'An exquisite silk evening gown designed for elegance and comfort. Features a flowing silhouette and delicate detailing.',
    rating: 4.8,
    reviews: 124,
    countInStock: 5,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gold'],
    images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=2071&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1983&auto=format&fit=crop'
    ]
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      qty,
      size: selectedSize,
      color: selectedColor
    }));
    // Typically show a toast here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Product Images */}
        <div className="w-full md:w-1/2 flex gap-4">
          <div className="flex flex-col gap-4 w-24">
            {product.images.map((img, i) => (
              <div key={i} className="h-32 bg-gray-100 cursor-pointer border border-transparent hover:border-gold transition-colors">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex-grow bg-gray-100 h-[600px] overflow-hidden group">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in" />
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => <FiStar key={i} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} />)}
            </div>
            <span className="text-sm opacity-60">({product.reviews} Reviews)</span>
          </div>
          
          <p className="text-3xl font-semibold text-gold mb-6">${product.price}</p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{product.description}</p>
          
          <div className="mb-6 border-t border-border-color pt-6">
            <h3 className="font-semibold mb-3 uppercase tracking-widest text-sm">Color</h3>
            <div className="flex gap-3">
              {product.colors.map(color => (
                <button 
                  key={color} 
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-gold' : 'border-transparent shadow-sm'}`}
                  style={{ backgroundColor: color.toLowerCase() === 'navy' ? '#000080' : color.toLowerCase() === 'gold' ? '#D4AF37' : '#0F0F0F' }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-3 uppercase tracking-widest text-sm">Size</h3>
            <div className="flex gap-3">
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border flex items-center justify-center transition-colors ${selectedSize === size ? 'border-gold bg-gold/10 text-gold' : 'border-border-color hover:border-gray-400'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center border border-border-color h-14 w-32">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><FiMinus /></button>
              <span className="flex-grow text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.countInStock, qty + 1))} className="w-10 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><FiPlus /></button>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="flex-grow h-14 bg-primary text-secondary dark:bg-white dark:text-black uppercase tracking-widest font-semibold hover:bg-gold dark:hover:bg-gold transition-colors duration-300"
            >
              Add to Cart
            </motion.button>
            
            <button className="h-14 w-14 border border-border-color flex items-center justify-center hover:text-gold hover:border-gold transition-colors">
              <FiHeart size={20} />
            </button>
          </div>
          
          <div className="text-sm opacity-60">
            <p>Availability: <span className={product.countInStock > 0 ? "text-green-600" : "text-red-500"}>{product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
