const SkeletonLoader = () => {
    return (
      <div className="">
        {/* Skeleton List */}
        <ul className="space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <li key={index} className="h-20 bg-gray-300 animate-pulse rounded"></li>
          ))}
        </ul>
  
        
      </div>
    );
  };
  
  export default SkeletonLoader;
  