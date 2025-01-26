import React, { useRef, useState } from "react";
import Button from "./button";

type CustomFileInputProps = {
  field: {
    value: File | undefined;
    onChange: (file: File | undefined) => void;
  };
  accept?: string;
  buttonText: string;
  buttonTextColor?: string;
  buttonBgColor?: string;
  disabled?: boolean;
};

export default function CustomFileInput({
  field,
  accept,
  buttonText,
  buttonTextColor = "text-black",
  buttonBgColor = "bg-white",
  disabled = false,
}: CustomFileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null); // Track the selected file name

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      field.onChange(file); // Pass the selected file to the form field
      setFileName(file.name); // Update the file name
    } else {
      field.onChange(undefined); // Clear the field if no file is selected
      setFileName(null); // Reset the file name
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input value
    }
    field.onChange(undefined); // Clear the form field
    setFileName(null); // Reset the file name
  };

  return (
    <div className="flex items-center mb-2">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />

      {/* Custom button and file name display */}
      <div className="flex items-center gap-2">
        <Button
          text={buttonText}
          textColor={buttonTextColor}
          bgColor={buttonBgColor}
          onClick={handleButtonClick}
          disable={disabled}
        />
        {fileName && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{fileName}</span>
            <Button
              text="Clear"
              textColor="text-white"
              bgColor="bg-red-500"
              onClick={handleClearFile}
              additionalClasses="px-2 py-1 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
