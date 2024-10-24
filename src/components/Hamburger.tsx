import React, { Ref, useEffect, useRef, useState } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";
import sitting from "../images/sitting.png";
import walking01 from "../images/walking01.png";
import { NONAME } from "dns";

export default function Hamburger(toc: any) {
  const ref = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { height, width } = useWindowDimensions();
  const [isDragging, setIsDragging] = useState(false);
  const initMargin = 10;
  const shift = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    //@ts-ignore
    shift.current = {
      //@ts-ignore
      x: e.clientX - ref.current.offsetLeft,
      //@ts-ignore
      y: e.clientY - ref.current.offsetTop
    };
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    //setIsDragging(e.buttons === 1)
    if (isDragging && ref.current) {
      if (e.buttons !== 1) return;
      setPosition({
        left: e.clientX - shift.current.x, //ref.current.offsetWidth / 2,
        top: e.clientY - shift.current.y //ref.current.offsetHeight / 2
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
      <img
        className="hamburger"
        ref={ref}
        src={isDragging ? walking01 : sitting}
        style={{
          left: position.left,
          top: position.top,
          margin: 0
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        draggable={false}
      />
    </>
  );
}

function randomMove(imageRef: Ref<HTMLImageElement>) {
  if (Math.random() > 0.9) {
    return;
  } else {
  }
}
