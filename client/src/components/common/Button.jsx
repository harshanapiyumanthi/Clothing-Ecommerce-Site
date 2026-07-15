const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = "flex items-center justify-center uppercase tracking-widest font-bold text-xs transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gold text-white hover:bg-black shadow-md shadow-gold/25",
    secondary: "bg-transparent border border-[var(--border-color)] text-[var(--text-color)] hover:border-gold hover:text-gold",
    outline: "bg-transparent border border-gold text-gold hover:bg-gold/10",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} px-6 py-4 ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
