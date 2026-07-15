const Loader = ({ fullScreen = false, size = 40 }) => {
  const style = {
    height: `${size}px`,
    width: `${size}px`
  };

  const containerClass = fullScreen 
    ? "min-h-[80vh] flex items-center justify-center bg-[var(--bg-color)]"
    : "flex items-center justify-center py-4";

  return (
    <div className={containerClass}>
      <div 
        style={style}
        className="border border-gold border-t-transparent rounded-full animate-spin"
      />
    </div>
  );
};

export default Loader;
