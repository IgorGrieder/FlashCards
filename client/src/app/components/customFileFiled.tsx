import { useState, useRef, useEffect } from "react";
import Button from "./button";
import ImagePreview from "./imagePreview"; // Componente novo que vamos criar

type CustomFileInputProps = {
  field: {
    value: File | undefined;
    onChange: (file: File | undefined) => void;
  };
  accept?: string;
  buttonText: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
};

export default function CustomFileInput({
  field,
  accept,
  buttonText,
  buttonTextColor = "text-black",
  buttonBgColor = "bg-white",
}: CustomFileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // URL preview 
  useEffect(() => {
    if (field.value) {
      const url = URL.createObjectURL(field.value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [field.value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    field.onChange(file || undefined);
  };

  const handleClear = () => {
    field.onChange(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="relative group">
          <ImagePreview
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        <Button
          text={buttonText}
          textColor={buttonTextColor}
          bgColor={buttonBgColor}
          onClick={() => fileInputRef.current?.click()}
        />

        {field.value && !previewUrl && (
          <span className="text-sm text-gray-600">
            {field.value.name}
          </span>
        )}
      </div>
    </div>
  );
}
