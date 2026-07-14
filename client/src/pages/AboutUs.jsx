import { motion } from 'framer-motion';

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in space-y-20">
      
      {/* Intro */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold uppercase tracking-widest text-[var(--text-color)]">
          The Art of Elegance
        </h1>
        <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        <p className="text-sm font-light text-gray-500 leading-relaxed pt-2">
          Founded on the philosophy of timeless craftsmanship, Elegance Fashion bridges the gap between haute couture customization and accessible luxury.
        </p>
      </section>

      {/* Craftsmanship & Editorial */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-[var(--text-color)]">
            Bespoke Tailoring, Reimagined
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Our atelier brings together decades of master-tailoring heritage with a digital-first design process. We believe that garments should be crafted to fit your individual body contours, rather than forcing you to adjust to rigid off-the-rack sizing standards.
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every custom gown, suit jacket, and accessory is individually constructed with meticulous attention to detail, using the finest silks, brocades, and linen blends. Our production lead time of five weeks reflects our commitment to slow, sustainable fashion.
          </p>
        </div>
        <div className="h-96 overflow-hidden rounded-xl border border-[var(--border-color)]">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop" 
            alt="Tailoring Atelier" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-gold/5 border border-gold/15 p-8 md:p-12 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3 text-center md:text-left">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gold">Masterful Precision</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            From the initial design sketch to the final steam pressing, our garments are crafted by hand to guarantee flawless seams.
          </p>
        </div>
        <div className="space-y-3 text-center md:text-left">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gold">Sustainable Slow Fashion</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            By creating garments made-to-order, we avoid raw textile waste, support fair-trade artisans, and reduce greenhouse emissions.
          </p>
        </div>
        <div className="space-y-3 text-center md:text-left">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gold">Custom Concierge</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Our online design reviews and bespoke adjustments provide customers with a direct connection to our design team.
          </p>
        </div>
      </section>
      
    </div>
  );
};

export default AboutUs;
