import React from "react";

const Card = ({
  children,
  padding = "1.5rem",
  shadow = false,
  hover = false,
  onClick,
  style = {},
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding,
        cursor: onClick ? "pointer" : "default",
        boxShadow: shadow ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        transition: hover ? "box-shadow 0.2s, transform 0.2s" : "none",
        ...style
      }}
      onMouseEnter={e => {
        if (hover) {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={e => {
        if (hover) {
          e.currentTarget.style.boxShadow = shadow ? "0 1px 3px rgba(0,0,0,0.08)" : "none";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;