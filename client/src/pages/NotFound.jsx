const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-bold text-gold mb-4">404</h1>
      <h2 className="text-3xl font-light uppercase tracking-widest mb-6">Page Not Found</h2>
      <p className="opacity-70 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <a href="/" className="bg-primary text-secondary px-8 py-3 uppercase tracking-widest text-sm hover:bg-gold transition-colors duration-300">
        Return Home
      </a>
    </div>
  );
};

export default NotFound;
