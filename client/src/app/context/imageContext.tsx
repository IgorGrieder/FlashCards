import { createContext, Dispatch, SetStateAction, useState } from "react";

type ImageCaching = {
    cache: string[];
    setCache: Dispatch<SetStateAction<string[]>>
}

export const ImageContext = createContext<ImageCaching | null>(null);

export function ImageContextProvider({children}: {children: React.ReactNode}) {
    const [cache, setCache] = useState<string[]>([]);
    return (
        <ImageContext.Provider value={{ cache, setCache }}>
            {children}
        </ImageContext.Provider>
    )
}