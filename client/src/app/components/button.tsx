type ButtonProps = {
  text: string;
  type?: "button" | "submit" | "reset";
  textColor?: string;
  bgColor?: string;
  onClick?: () => void;
  disable?: boolean;
  additionalClasses?: string;
  children?: React.ReactNode;
};

export default function Button({
  text,
  type = "button",
  textColor = "text-black",
  bgColor = "bg-white",
  onClick,
  disable = false,
  additionalClasses = "",
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`px-3 py-4 flex items-center text-sm transition-colors hover:text-white border-gray-300 border hover:bg-black sm:text-base rounded-lg cursor-pointer ${bgColor} ${textColor} ${additionalClasses} disabled:opacity-30 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disable}
    >
      {children}
      {text}
    </button>
  );
}
