import React, { useState, useRef, useEffect, useCallback } from "react";

const FeaturePopup = ({ children, content, contents, overlay, placement = "right", id }) => {
  const [hovered, setHovered] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [page, setPage] = useState(0);
  const ref = useRef(null);

  // Close inline popup on click outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setHovered(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Close overlay on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setOverlayOpen(false);
    };
    if (overlayOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [overlayOpen]);

  const handleClick = useCallback(() => {
    if (overlay && contents?.length) {
      setPage(0);
      setOverlayOpen(true);
      setHovered(false);
    } else {
      setHovered((v) => !v);
    }
  }, [overlay, contents]);

  // Determine inline popup content: prefer first item of `contents`, fallback to `content`
  const inlineContent = contents?.[0] || content;
  const pages = contents || (content ? [content] : []);

  return (
    <>
      <div
        className="feature-popup-wrapper"
        ref={ref}
        onMouseEnter={() => !overlay && setHovered(true)}
        onMouseLeave={() => !overlay && setHovered(false)}
      >
        <button
          className="feature-button"
          onClick={handleClick}
          aria-expanded={hovered || overlayOpen}
          type="button"
        >
          {children}
        </button>

        {/* Inline hover popup (non-overlay mode only) */}
        {!overlay && (
          <div
            className={`feature-popup ${hovered ? "visible" : ""} placement-${placement}`}
            role="dialog"
            aria-hidden={!hovered}
          >
            <div className="feature-popup-inner">{inlineContent}</div>
          </div>
        )}
      </div>

      {/* Full overlay modal */}
      {overlay && (
        <div
          className={`feature-overlay ${overlayOpen ? "visible" : ""}`}
          role="dialog"
          aria-hidden={!overlayOpen}
          aria-label={id || "Feature details"}
        >
          <div
            className="feature-overlay-backdrop"
            onClick={() => setOverlayOpen(false)}
          />
          <div className="feature-overlay-card">
            <button
              className="feature-overlay-close"
              onClick={() => setOverlayOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="feature-overlay-content">
              {pages[page]}
            </div>

            {/* Pagination dots */}
            {pages.length > 1 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1.5rem"
              }}>
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    aria-label={`Page ${i + 1}`}
                    style={{
                      width: page === i ? "1.5rem" : "0.5rem",
                      height: "0.5rem",
                      borderRadius: "999px",
                      border: "none",
                      background: page === i
                        ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                        : "rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturePopup;
