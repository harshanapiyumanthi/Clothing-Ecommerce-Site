import { useState } from 'react';

const ProductGallery = ({ images, productName }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const displayImages = images?.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80' }];

  return (
    <div className="w-full lg:w-1/2 flex gap-4">
      <div className="flex flex-col gap-4 w-24">
        {displayImages.map((img, i) => (
          <div 
            key={i} 
            onClick={() => setActiveImageIndex(i)}
            className={`h-32 bg-gray-150 cursor-pointer border transition-colors ${activeImageIndex === i ? 'border-gold shadow-sm' : 'border-[var(--border-color)] hover:border-gold'}`}
          >
            <img src={img.url || img} alt={`Thumbnail ${i}`} loading="lazy" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="flex-grow bg-gray-150 h-[500px] sm:h-[600px] overflow-hidden group border border-[var(--border-color)] relative">
        <img 
          src={displayImages[activeImageIndex]?.url || displayImages[activeImageIndex]} 
          alt={productName} 
          loading="eager"
          className="w-full h-full object-cover origin-center transition-transform duration-350 hover:scale-125 cursor-zoom-in" 
        />
      </div>
    </div>
  );
};

export default ProductGallery;
