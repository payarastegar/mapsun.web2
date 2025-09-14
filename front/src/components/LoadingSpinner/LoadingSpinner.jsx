import React from "react";
import "./LoadingSpinner.css"; // Ensure to create this CSS file

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
