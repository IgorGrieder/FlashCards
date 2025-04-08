import { createContext, MutableRefObject, useRef  } from "react";

type ImageCaching = MutableRefObject<string[]>;

export const ImageContext = createContext<ImageCaching | null>(null);

export function ImageContextProvider({children}: {children: React.ReactNode}) {
    const cache = useRef<string[]>([]);

    return (
        <ImageContext.Provider value={cache}>
            {children}
        </ImageContext.Provider>
    )
}