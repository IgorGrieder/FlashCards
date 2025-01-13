import { useState, useEffect } from 'react';

type UseBase64ImageResult = {
  imageDataUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const useBase64Image = (base64Data: string | null, contentType: string | null): UseBase64ImageResult => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!base64Data || !contentType) {
      setImageDataUrl(null);
      setIsLoading(false);
      return;
    }

    try {
      const dataUrl = `data:${contentType};base64,${base64Data}`;
      setImageDataUrl(dataUrl);
      setIsLoading(false);
    } catch (err) {
      setError((err as Error).message || 'An unknown error occurred')
      setIsLoading(false);
    }
  }, [base64Data, contentType]);

  return { imageDataUrl, isLoading, error };
};

/* 
 * 
 *
 * const { imageDataUrl, isLoading, error } = useBase64Image(
        card.img?.data || null,
        card.img?.contentType || null
    );

    if (isLoading) {
        return <div>Loading image...</div>;
    }

    if (error) {
        return <div>Error loading image: {error}</div>;
    }

    return (
        <div>
            <h2>{card.question}</h2>
            <p>{card.answer}</p>
            {imageDataUrl && <img src={imageDataUrl} alt="Card Image" />}
            {!imageDataUrl && (<p>No Image</p>)}
        </div>
    );
*/

export default useBase64Image;
