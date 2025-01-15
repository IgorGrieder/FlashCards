type ImageModalProps = {
  src: string;
  alt: string;
}
export default function ImageModal({ src, alt }: ImageModalProps) {
  return <div className="absolute w-scree h-screen bg-black/60">
    <img src={src} alt={alt} />
  </div>
}
