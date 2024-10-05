import Layout from "../components/Layout";
import React, { FormEvent, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  stagger,
  useAnimate,
  useTransform,
  useScroll
} from "framer-motion";

export default function Demo({ location }: { location: Location }) {
  const [x, setX] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [motionFormRef, motionFormAnimate] = useAnimate();
  const handleInputSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = formData.get("demo-input");
    if (!value) {
      motionFormAnimate(
        "input",
        {
          rotateZ: [3, 0, -3, 0],
          rotateY: [3, 0, -3, 0]
        },
        {
          duration: 0.2
        }
      );
    }
  };
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(
    scrollY,
    [0, 200, 300, 500, 1000],
    [0, 0.2, 0.3, 0.5, 1]
  );

  return (
    <Layout location={location} setCurTag={undefined}>
      <h1>데모 놀이터입니다</h1>
      <h2 id="1">{"1)"}</h2>
      <motion.div
        animate={{ x }}
        transition={{
          type: "spring",
          bounce: 1
        }}
        style={{ backgroundColor: "lightgreen", width: "fit-content" }}
      >
        <button onClick={() => setX(prev => prev - 100)}>{"<-"}</button>
        안녕하세요? 지나가겠습니다{" "}
        <button onClick={() => setX(prev => prev + 100)}>{"->"}</button>
      </motion.div>
      <h2 id="2">{"2)"}</h2>
      <motion.button
        whileHover={{ scale: 1.5 }}
        onClick={() => setIsModalOpen(true)}
      >
        모달 열기
      </motion.button>
      <AnimatePresence>
        {isModalOpen && (
          <motion.dialog
            style={{
              width: "200px",
              height: "200px",
              backgroundColor: "gray",
              borderRadius: "20px"
            }}
            onClose={() => setIsModalOpen(false)}
            open={isModalOpen}
            variants={{
              hidden: {
                opacity: 0,
                y: 30
              },
              visible: {
                opacity: 1,
                y: 0
              }
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <p>안녕하세요? 모달입니다</p>
            <motion.button
              whileHover={{ scale: 1.5 }}
              onClick={() => setIsModalOpen(false)}
            >
              모달 닫기
            </motion.button>
          </motion.dialog>
        )}
      </AnimatePresence>

      {/* 3번째 */}
      <h2 id="3">{"3)"}</h2>
      <button onClick={() => setIsVisible(prev => !prev)}>
        {isVisible ? "나가세요" : "들어오세요"}
      </button>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            layout
            style={{ display: "flex", gap: "20px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              },
              hidden: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: 0,
                  opacity: 1
                },
                hidden: {
                  y: 30,
                  opacity: 0
                }
              }}
              layout
            >
              나
            </motion.div>
            <motion.div
              layout
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: 0,
                  opacity: 1
                },
                hidden: {
                  y: 30,
                  opacity: 0
                }
              }}
            >
              는
            </motion.div>
            <motion.div
              layout
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: 0,
                  opacity: 1
                },
                hidden: {
                  y: 30,
                  opacity: 0
                }
              }}
            >
              바
            </motion.div>
            <motion.div
              layout
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: 0,
                  opacity: 1
                },
                hidden: {
                  y: 30,
                  opacity: 0
                }
              }}
            >
              보
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4번째 */}
      <h2 id="4">{"4)"}</h2>
      <button onClick={() => setIsVisible2(prev => !prev)}>
        {isVisible2 ? "나가세요" : "들어오세요"}
      </button>
      <AnimatePresence>
        {isVisible2 && (
          <motion.div
            style={{ display: "flex", gap: "20px" }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              },
              hidden: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: [0, 10, -10, 0],
                  opacity: 1
                },
                hidden: {
                  y: 30,
                  opacity: 0
                }
              }}
            >
              나
            </motion.div>
            <motion.div
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: [0, 10, -10, 0],
                  opacity: 1
                },
                hidden: {
                  y: [0, 10, -10, 0],
                  opacity: 0
                }
              }}
            >
              는
            </motion.div>
            <motion.div
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: [0, 10, -10, 0],
                  opacity: 1
                },
                hidden: {
                  y: 30,
                  opacity: 0
                }
              }}
            >
              바
            </motion.div>
            <motion.div
              style={{ width: "30px", height: "30px" }}
              variants={{
                visible: {
                  y: [0, 10, -10, 0],
                  opacity: 1
                },
                hidden: {
                  y: 30,
                  opacity: 0
                }
              }}
            >
              보
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5번째 */}
      <h2 id="5">{"5)"}</h2>
      <AnimatePresence>
        <form ref={motionFormRef} onSubmit={handleInputSubmit}>
          <input
            name="demo-input"
            style={{ backgroundColor: "white", color: "black" }}
          />
          <button>입력</button>
        </form>
      </AnimatePresence>

      {/* 6번째 */}
      <h2 id="6">{"6)"} </h2>
      <motion.div
        style={{
          height: 1000,
          width: "100%",
          backgroundColor: "currentColor",
          opacity: scrollOpacity
        }}
      ></motion.div>
    </Layout>
  );
}
