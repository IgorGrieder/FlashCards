import { createContext, useEffect, useState } from "react";
import { ImageCaching } from "../types/types";

const ImagesContext = createContext<{ cache: ImageCaching; updateCache: (collectionId: string, images: Record<string, string>) => void }>(
  ({ cache: {}, updateCache: () => { } }));

export default function ImageProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<ImageCaching>({});

  const updateCache = (collectionId: string, images: Record<string, string>) => {
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
