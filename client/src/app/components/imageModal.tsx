import { useState } from "react";

type ImageModalProps = {
  src: string;
  alt: string;
  closeModal: VoidFunction;
};

export default function ImageModal({ src, alt, closeModal }: ImageModalProps) {
  const [scale, setScale] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setScale(1.2); // Set the zoom level when hovered
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScale(1); // Reset the zoom level when not hovered
  };

  return (
    <div
      className="fixed inset-0 z-50 w-screen h-screen bg-black/80 flex items-center justify-center p-4"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col items-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex-1 w-full relative flex items-center justify-center overflow-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isHovered ? "zoom-in" : "auto" }}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain transition-transform duration-200 ease-in-out"
            style={{
              transform: `scale(${scale})`
            }}
          />
        </div>
      </div>
    </div>
  );
}
