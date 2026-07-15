const Skeleton = ({ className = '', style = {} }) => {
  return (
    <div 
      style={style}
      className={`animate-pulse bg-gray-200 dark:bg-gray-850 rounded ${className}`}
    />
  );
};

Skeleton.Rect = ({ className = '', height = '200px', width = '100%' }) => (
  <Skeleton className={className} style={{ height, width }} />
);

Skeleton.Circle = ({ className = '', size = '40px' }) => (
  <Skeleton className={`rounded-full ${className}`} style={{ height: size, width: size }} />
);

Skeleton.Text = ({ className = '', lines = 1 }) => {
  return (
    <div className="space-y-2 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-3 rounded ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'} ${className}`} 
        />
      ))}
    </div>
  );
};

export default Skeleton;
