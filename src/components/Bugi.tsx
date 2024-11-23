import React, { Ref, useEffect, useRef, useState } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";
//@ts-ignore
import sitting from "../images/sitting.png";
//@ts-ignore
import walking01 from "../images/walking00.png";
//@ts-ignore
import walking02 from "../images/walking01.png";
//@ts-ignore
import walking03 from "../images/walking02.png";
//@ts-ignore
import standing from "../images/standing.png";
import { createPortal } from "react-dom";

export default function Bugi(toc: any) {
  const ref = useRef<HTMLImageElement>(null);
  const [position, setPosition] = useState({ top: 200, left: 100 });
  const { height, width } = useWindowDimensions();
  const [isDragging, setIsDragging] = useState(false);
  const initMargin = 10;
  const shift = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef(0);
  const [isWalking, setIsWalking] = useState(false);
  const startTimestamp = useRef(0);
  const [pose, setPose] = useState(sitting);
  const [isFlipped, setIsFlipped] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const emotions = [
    "( ´ ▽ ` )",
    "(´･ω･`)",
    "(´｡• ω •｡`)",
    "(っ˘ڡ˘ς)",
    "(｡•́︿•̀｡)",
    "(´～｀*)｡｡oO"
  ];
  const walkingPoses = [walking01, walking03, walking02];
  const [emotionIndex, setEmotionIndex] = useState(
    Math.floor(Math.random()) * emotions.length
  );

  const animateWalk = (timestamp: number, targetX: number, targetY: number) => {
    if (!startTimestamp.current) {
      startTimestamp.current = timestamp;
    }
    const elapsed = timestamp - startTimestamp.current;

    if (elapsed > 5000) {
      setIsWalking(false);
      setPose(sitting);
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = 0;
      startTimestamp.current = 0;
      return;
    }
    const currentPoseIndex = Math.floor(elapsed / 500) % 3;
    setPose(walkingPoses[currentPoseIndex]);
    const dx = targetX - position.left;
    const dy = targetY - position.top;
    setPosition(prev => {
      return {
        left: prev.left + dx / 1000,
        top: prev.top + dy / 1000
      };
    });

    animationFrameId.current = requestAnimationFrame(timestamp =>
      animateWalk(timestamp, targetX, targetY)
    );
  };

  const startWalk = (method: "click" | "auto") => {
    if ((method === "click" && dragged) || isWalking) return;

    const range = 200;

    const targetX = Math.random() * range * 2 - range + position.left; // 현재 위치에서 -300 ~ +300 범위
    const targetY = Math.random() * range * 2 - range + position.top; // 현재 위치에서 -300 ~ +300 범위
    const clampedX = Math.max(
      0,
      Math.min(targetX, width - (ref.current?.offsetWidth || 0))
    ); // 화면 내로 제한
    const clampedY = Math.max(
      0,
      Math.min(targetY, height - (ref.current?.offsetHeight || 0))
    ); // 화면 내로 제한
    setIsWalking(true);
    setPose(walking01);
    setIsFlipped(position.left - clampedX > 0);
    animationFrameId.current = requestAnimationFrame(timestamp =>
      animateWalk(timestamp, clampedX, clampedY)
    );
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setEmotionIndex(Math.floor(Math.random() * emotions.length));
    setDragged(false);
    setIsDragging(true);
    setPose(standing);
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
    setPose(sitting);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTooltipVisible(true);
    handleMouseDown(e);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    setTooltipVisible(false);
    handleMouseUp();
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    //setIsDragging(e.buttons === 1)
    if (isDragging && ref.current) {
      if (e.buttons !== 1) return;
      setDragged(true);
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

  // useEffect(() => {
  //   if (ref.current) {
  //     setPosition({
  //       left: width - ref.current.offsetWidth - initMargin,
  //       top: height - ref.current.offsetHeight - initMargin
  //     });
  //   }
  // }, [width, height]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | number;
    const intervalId = setInterval(() => {
      if (!tooltipVisible && Math.random() < 0.1) {
        setTooltipVisible(true);
        setEmotionIndex(Math.floor(Math.random() * emotions.length));
        timeoutId = setTimeout(() => {
          setTooltipVisible(false);
        }, 2000);
      } else {
      }
    }, 2000); // 2초마다 확률 체크

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    }; // 컴포넌트 언마운트 시 interval 정리
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isDragging]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // walking 중이 아니고, dragging 중이 아닐 때 10% 확률로 walking 시작
      if (!isWalking && !isDragging && Math.random() < 0.1) {
        startWalk("auto");
      }
    }, 2000); // 2초마다 확률 체크

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 interval 정리
  }, [isWalking, isDragging]); // isWalking, isDragging 상태에 따라 다시 체크

  useEffect(() => {
    setIsClient(true);

    return () => setIsClient(false);
  }, []);

  if (!isClient) return null;
  return createPortal(
    <>
      <img
        className="hamburger"
        ref={ref}
        src={pose}
        style={{
          left: position.left,
          top: position.top,
          margin: 0,
          transform: isFlipped ? "scaleX(-1)" : "scaleX(1)"
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        // onMouseLeave={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        draggable={false}
        onClick={() => startWalk("click")}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      />
      <div
        className="tooltip"
        style={{
          position: "fixed",
          left: position.left - (width > 720 ? 40 : 45),
          top: position.top - (width > 720 ? 0 : 5),
          width: 110,
          height: 40,
          whiteSpace: "nowrap"
        }}
      >
        <div
          className="tooltip-text"
          style={{
            width: "100%",
            height: "100%",
            visibility: tooltipVisible ? "visible" : "hidden",
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          {isDragging ? "(o_O)" : emotions[emotionIndex]}
        </div>
      </div>
    </>,
    document.body
  );
}
