type ButtonProps = {
  text: string;
  textColor?: string;
  bgColor?: string;
  onClick: () => void;
  additionalClasses?: string;
};

export default function Button({
  text,
  textColor = "text-black",
  bgColor = "bg-transparent",
  onClick,
  additionalClasses = "",
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 rounded-xl border border-black ${bgColor} ${textColor} ${additionalClasses}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
