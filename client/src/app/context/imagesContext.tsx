import { createContext, useEffect, useState } from "react";
import { ImageCaching } from "../types/types";

export const ImagesContext = createContext<{ cache: ImageCaching; updateCache: (collectionId: string, images: Record<string, string>) => void }>(
  ({ cache: {}, updateCache: () => { } }));

export default function ImageProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<ImageCaching>({});

  const updateCache = (collectionId: string, images: Record<string, string>) => {
    // First revoke any existing object URLs to prevent memory leaks
    if (cache[collectionId]?.images) {
      Object.values(cache[collectionId].images).forEach(url => {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    }

    setCache((prevCache) => ({
      ...prevCache,
      [collectionId]: {
        timestamp: Date.now(),
        images
      }
    }));
  }

  // Automatic cache cleanup (LRU strategy)
  useEffect(() => {
    const interval = setInterval(() => {
      setCache(prev => {
        const now = Date.now();
        return Object.fromEntries(
          Object.entries(prev).filter(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_, entry]) => now - entry.timestamp < 1000 * 60 * 30 // 30-minute TTL
          )
        );
      });
    }, 1000 * 60 * 5); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <ImagesContext.Provider value={{ cache, updateCache }}>
      {children}
    </ImagesContext.Provider>
  );
}
