type ButtonProps = {
  text: string;
  textColor?: string;
  bgColor?: string;
  onClick: () => void;
  additionalClasses?: string;
  children?: React.ReactNode;
};

export default function Button({
  text,
  textColor = "text-black",
  bgColor = "bg-white",
  onClick,
  additionalClasses = "",
  children,
}: ButtonProps) {
  return (
    <button
      className={`px-3 py-4 flex items-center text-sm transition-colors hover:text-white border-gray-300 border hover:bg-black sm:text-base rounded-lg cursor-pointer ${bgColor} ${textColor} ${additionalClasses}`}
      onClick={onClick}
    >
      {children}
      {text}
    </button>
  );
}
