import { RefObject, useEffect } from "react";

// Hook to scroll into view of objects
export const useScrollIntoView = (ref: RefObject<HTMLDivElement>, state: boolean) => {
  useEffect(() => {
    if (state && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state, ref])
}
