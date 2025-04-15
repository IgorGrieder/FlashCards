import { createContext, MutableRefObject, useRef } from "react";
import { ImageCtx } from "../types/types";

type ImageCaching = {
  cache: MutableRefObject<ImageCtx>;
  revokeCache: VoidFunction;
  insertCache: (url: string, cardId: string) => void;
}

export const ImageContext = createContext<ImageCaching | null>(null);

export function ImageContextProvider({ children }: { children: React.ReactNode }) {
  const cache = useRef<ImageCtx>({});

  const revokeCache = (): void => {
    const keys = Object.values(cache.current);
    for (const key of keys) {
      URL.revokeObjectURL(cache.current[key]);
    }
  }

  const insertCache = (url: string, cardId: string): void => {
    cache.current[cardId] = url;
  }

  return (
    <ImageContext.Provider value={{ cache, revokeCache, insertCache }}>
      {children}
    </ImageContext.Provider>
  )
}
