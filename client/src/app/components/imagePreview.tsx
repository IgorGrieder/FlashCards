import { useState } from "react";
import ImageModal from "./imageModal";

type ImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className={`relative cursor-pointer ${className}`}
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-lg transition-transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium">Clique para expandir</span>
        </div>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        src={src}
        alt={alt}
      />
    </>
  );
}
