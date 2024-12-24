import { useRef } from "react";

export function useArrowMovement(
  onMove: (direction: "left" | "right") => void,
) {
  const frameId = useRef<number | null>(null);

  const start = (direction: "left" | "right") => {
    const move = () => {
      onMove(direction);
      frameId.current = requestAnimationFrame(move); // Schedule the next move
    };
    move(); // Start the loop
  };

  const stop = () => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    } // Stop the loop
  };

  return { start, stop };
}
