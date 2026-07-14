const TermsConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)]">
          Terms & Conditions
        </h1>
        <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        <p className="text-xs text-gray-500">Last Updated: July 14, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs text-gray-500 leading-relaxed space-y-6">
        <p>
          Welcome to Elegance Fashion. By accessing or purchasing from our boutique platform, you agree to comply with and be bound by the following Terms & Conditions.
        </p>

        <h3 className="text-sm font-semibold uppercase text-gold tracking-wider mt-4">1. Purchase & Customization Agreements</h3>
        <p>
          By submitting custom measurements, uploading sketches, and confirming your customized dress details, you authorize our design atelier to proceed with raw material preparations. Because customized orders are handcrafted specifically to your sizing requirements, these transactions represent a binding, final sale contract and are non-refundable.
        </p>

        <h3 className="text-sm font-semibold uppercase text-gold tracking-wider mt-4">2. Processing & Delivery Timelines</h3>
        <p>
          Custom tailoring requires approximately 5 weeks of production lead time. Any delivery estimates provided are projections and may vary slightly due to material sourcing delays or craftsmanship requirements.
        </p>

        <h3 className="text-sm font-semibold uppercase text-gold tracking-wider mt-4">3. Content Ownership</h3>
        <p>
          All product photos, text descriptions, design elements, and logos displayed on this site are the intellectual property of Elegance Fashion.
        </p>
      </div>
    </div>
  );
};

export default TermsConditions;
