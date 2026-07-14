const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[var(--text-color)]">
          Privacy Policy
        </h1>
        <div className="h-0.5 w-16 bg-gold mx-auto"></div>
        <p className="text-xs text-gray-500">Effective Date: July 14, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs text-gray-500 leading-relaxed space-y-6">
        <p>
          At Elegance Fashion, your privacy is of paramount importance to us. This Privacy Policy documents the types of personal data we collect, how we protect it, and your rights concerning its utilization.
        </p>

        <h3 className="text-sm font-semibold uppercase text-gold tracking-wider mt-4">1. Data We Collect</h3>
        <p>
          We collect information that you share directly with us, such as when you create an account, purchase products, design custom measurements, upload sketch references, or register for newsletter updates. This includes name, email, billing/shipping address, custom measurements, and payment method details.
        </p>

        <h3 className="text-sm font-semibold uppercase text-gold tracking-wider mt-4">2. Cookies and Tracking</h3>
        <p>
          We use cookies and similar tracking identifiers to manage shopping carts, remember preferences, and analyze website traffic. You can adjust your browser configurations to decline cookies, though some features of our site may not function optimally.
        </p>

        <h3 className="text-sm font-semibold uppercase text-gold tracking-wider mt-4">3. Custom Tailoring Assets</h3>
        <p>
          Any inspiration images, sketches, and measurement records uploaded for custom tailoring services are protected and only accessible by our design and tailoring staff.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
