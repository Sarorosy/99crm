import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const CustomLoader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-48">
      {loading ? (
        <ClipLoader
          color="#3498db" // Customize color
          size={60}       // Customize size
          speedMultiplier={2} // Customize speed
        />
      ) : (
        <h1>Data Loaded</h1>
      )}
    </div>
  );
};

export default CustomLoader;
