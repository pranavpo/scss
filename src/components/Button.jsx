import React from 'react';

const Button = ({ label, color, onClick }) => {
  const baseStyles = "px-4 py-2 rounded-lg text-white font-semibold cursor-pointer";
  const colorStyles = color === "primary" 
    ? "bg-green-500 hover:bg-green-700" 
    : "bg-blue-500 hover:bg-blue-700";

  return (
    <button className={`${baseStyles} ${colorStyles}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;