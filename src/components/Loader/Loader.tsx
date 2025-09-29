import React from "react";
import "./Loader.css"; // or use Tailwind (see below)
const DotLoader = () => {
  return (
    <div className="loader-container">
      <div className="dot dot1" />
      <div className="dot dot2" />
      <div className="dot dot3" />
      <div className="dot dot4" />
      <div className="dot dot5" />
    </div>
  );
};
export default DotLoader;