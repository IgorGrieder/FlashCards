import { AnimatePresence, motion } from "framer-motion";

type ImageModalProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  src: string;
  alt: string;
};

export default function ImageModal({ isOpen, onClose, src, alt }: ImageModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose} // Fecha ao clicar fora
        >
          <div className="relative max-w-full max-h-[90vh]">
            {/* Botão de fechar */}
            <button
              onClick={onClose}
              className="absolute -top-8 -right-8 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Imagem */}
            <motion.img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()} // Impede fechamento ao clicar na imagem
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
