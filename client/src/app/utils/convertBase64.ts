// Function to convert to base 64
export default function convertToBase64(file: File): Promise<{ base64: string, type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        resolve({ base64: reader.result.toString(), type: file.type });
      } else {
        reject("Failed to read file.");
      }
    };
    reader.onerror = () => reject("Error reading file.");
    reader.readAsDataURL(file);
  });
};


