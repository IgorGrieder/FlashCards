import { useRef, useEffect } from "react";
import { Direction } from "../types/types";

export function useArrowMovement(
  onMove: (direction: Direction) => void,
  throttleTime: number = 400,
) {
  const animationFrameId = useRef<number | null>(null);
  const lastMoveTime = useRef(0);

  const start = (direction: Direction) => {
    const step = (time: number) => {
      if (
        !lastMoveTime.current ||
        time - lastMoveTime.current >= throttleTime
      ) {
        onMove(direction); // Trigger movement
        lastMoveTime.current = time;
      }
      animationFrameId.current = requestAnimationFrame(step); // Schedule next frame
    };

    animationFrameId.current = requestAnimationFrame(step); // Start the animation loop
  };

  const stop = () => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current); // Stop the animation loop
      animationFrameId.current = null;
    }
  };

  useEffect(() => {
    return () => stop(); // Cleanup on unmount
  }, []);

  return { start, stop };
}
