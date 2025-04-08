import { createContext, MutableRefObject, useRef  } from "react";

type ImageCaching = {
    cache: MutableRefObject<string[]>;
    revokeCache: VoidFunction;
    insertCache: (url: string) => void;
}

export const ImageContext = createContext<ImageCaching | null>(null);

export function ImageContextProvider({children}: {children: React.ReactNode}) {
    const cache = useRef<string[]>([]);

    const revokeCache = (): void => {
        for (const url in cache.current) {
            URL.revokeObjectURL(url);
        }
    }

    const insertCache = (url: string): void => {
        cache.current.push(url);
    }
    return (
        <ImageContext.Provider value={{ cache, revokeCache, insertCache }}>
            {children}
        </ImageContext.Provider>
    )
}