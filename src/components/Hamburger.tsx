import React, { useEffect, useRef, useState } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";

export default function Hamburger(toc: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { height, width } = useWindowDimensions();
  const [isDragging, setIsDragging] = useState(false);
  const initMargin = 10;

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    //setIsDragging(e.buttons === 1)
    if (isDragging && ref.current) {
      if (e.buttons !== 1) return;
      setPosition({
        left: e.clientX - ref.current.offsetWidth / 2,
        top: e.clientY - ref.current.offsetHeight / 2
      });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (isDragging && ref.current) {
      e.preventDefault();
      setPosition({
        left: touch.clientX - ref.current.offsetWidth / 2,
        top: touch.clientY - ref.current.offsetHeight / 2
      });
    }
  };

  useEffect(() => {
    if (ref.current) {
      setPosition({
        left: width - ref.current.offsetWidth - initMargin,
        top: height - ref.current.offsetHeight - initMargin
      });
    }
  }, [width, height]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging]);

  return (
    <>
      <div
        className="hamburger"
        ref={ref}
        style={{ left: position.left, top: position.top }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        🍔
      </div>
    </>
  );
}
