import React, { useState, useRef, useEffect } from "react";

const FeaturePopup = ({ children, content, placement = "right" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div
      className="feature-popup-wrapper"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="feature-button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {children}
      </button>

      <div
        className={`feature-popup ${open ? "visible" : ""} placement-${placement}`}
        role="dialog"
        aria-hidden={!open}
      >
        <div className="feature-popup-inner">{content}</div>
      </div>
    </div>
  );
};

export default FeaturePopup;
